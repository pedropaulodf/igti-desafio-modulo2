import express from "express";
import { promises as fs } from "fs";
import { parse } from "path";

const router = express.Router();

const { readFile, writeFile, appendFile } = fs;

/**
 * {"id":1,
 * "student":"Loiane Groner",
 * "subject":"01 - JavaScript",
 * "type":"Fórum",
 * "value":15,
 * "timestamp":"2020-05-19T18:21:24.958Z"}
 */

/**
 1. Crie um endpoint para criar uma grade. Este endpoint deverá receber como parâmetros os campos student, subject, type e value conforme descritos acima. Esta grade deverá ser salva no arquivo json grades.json, e deverá ter um id único associado. No campo timestamp deverá ser salvo a data e hora do momento da inserção. O endpoint deverá retornar o objeto da grade que foi criada. A API deverá garantir o incremento automático deste identificador, de forma que ele não se repita entre os registros. Dentro do arquivo grades.json que foi fornecido para utilização no desafio o campo nextId já está com um valor definido. Após a inserção é preciso que esse nextId seja incrementado e salvo no próprio arquivo, de forma que na próxima inserção ele possa ser utilizado.
 */

router.post("/", async (req, res, next) => {
    try {
        let newEntry = [];
        const postData = req.body;
        const fileGrades = JSON.parse(await readFile(global.fileName));

        newEntry = {
            id: fileGrades.nextId++,
            student: postData.student,
            subject: postData.subject,
            type: postData.type,
            value: postData.value,
            timestamp: new Date()
        };

        fileGrades.grades.push(newEntry);

        writeFile(global.fileName, JSON.stringify(fileGrades, null, 2));

        res.send(newEntry);
    } catch (err) {
        next(err);
    }
})

/**
2. Crie um endpoint para atualizar uma grade. Este endpoint deverá receber como parâmetros o id da grade a ser alterada e os campos student, subject, type e value. O endpoint deverá validar se a grade informada existe, caso não exista deverá retornar um erro. Caso exista, o endpoint deverá atualizar as informações recebidas por parâmetros no registro, e realizar sua atualização com os novos dados alterados no arquivo grades.json.
 */

router.put("/", async (req, res, next) => {
    try {
        const putData = req.body;
        const fileGrades = JSON.parse(await readFile(global.fileName));

        let gradeExists = fileGrades.grades.find(grade => {
            return grade.id === parseInt(putData.id);
        });

        if (gradeExists === undefined) {
            throw new Error("Essa grade não existe em nosso banco!");
            res.send("Essa grade não existe em nosso banco!");
        }

        const indexGrade = fileGrades.grades.findIndex(grade => grade.id === parseInt(putData.id));

        fileGrades.grades[indexGrade].id = putData.id;
        fileGrades.grades[indexGrade].student = putData.student;
        fileGrades.grades[indexGrade].subject = putData.subject;
        fileGrades.grades[indexGrade].type = putData.type;
        fileGrades.grades[indexGrade].value = putData.value;

        writeFile(global.fileName, JSON.stringify(fileGrades, null, 2));

        res.send("Grade atualizado com sucesso!");
    } catch (err) {
        next(err);
    }
});

/**
3. Crie um endpoint para excluir uma grade. Este endpoint deverá receber como
parâmetro o id da grade e realizar sua exclusão do arquivo grades.json.
 */

router.delete("/:id", async (req, res, next) => {
    try {
        const deleteData = req.params.id;
        const fileGrades = JSON.parse(await readFile(global.fileName));

        let gradeExists = fileGrades.grades.find(grade => {
            return grade.id === parseInt(deleteData);
        });

        if (gradeExists === undefined) {
            throw new Error("Essa grade não existe em nosso banco!");
            res.send("Essa grade não existe em nosso banco!");
        }

        const indexGrade = fileGrades.grades.findIndex(grade => grade.id === parseInt(deleteData));

        fileGrades.grades.splice(indexGrade, 1);

        writeFile(global.fileName, JSON.stringify(fileGrades, null, 2));

        res.send(`Grade [${deleteData}] exluída com sucesso`);
    } catch (err) {
        next(err);
    }
});


/**
4. Crie um endpoint para consultar uma grade em específico. Este endpoint deverá receber como parâmetro o id da grade e retornar suas informações.
 */

router.get("/:id", async (req, res, next) => {
    try {
        const getData = req.params.id;
        const fileGrades = JSON.parse(await readFile(global.fileName));

        let gradeExists = fileGrades.grades.find(grade => {
            return grade.id === parseInt(getData);
        });

        if (gradeExists === undefined) {
            throw new Error("Essa grade não existe em nosso banco!");
            res.send("Essa grade não existe em nosso banco!");
        }

        const indexGrade = fileGrades.grades.findIndex(grade => grade.id === parseInt(getData));

        console.log(fileGrades.grades[indexGrade]);
        res.send(fileGrades.grades[indexGrade]);
    } catch (err) {
        next(err);
    }
});


/**
5. Crie um endpoint para consultar a nota total de um aluno em uma disciplina. O endpoint deverá receber como parâmetro o student e o subject, e realizar a soma de todas os as notas de atividades correspondentes a aquele subject para aquele student. O endpoint deverá retornar a soma da propriedade value dos registros encontrados.
 */

router.get("/total/:student/:subject", async (req, res, next) => {
    try {
        const getData = req.params;
        let studentTotalSubjectValue = 0;
        const fileGrades = JSON.parse(await readFile(global.fileName));

        let student = fileGrades.grades.find(grade => {
            return grade.student === getData.student;
        });

        if (student === undefined) {
            throw new Error("Esse estudante não existe!");
            res.send("Esse estudante não existe!");
        }

        fileGrades.grades.filter(grade => {
            if (grade.student === getData.student && getData.subject === grade.subject) {
                console.log(grade.student + " - " + grade.subject)
                studentTotalSubjectValue += grade.value;
            }
        });

        console.log(studentTotalSubjectValue);

        res.send(`${getData.student} tem o total de ${studentTotalSubjectValue} pontos em ${getData.subject}.`);
    } catch (err) {
        next(err);
    }
});

/**
6. Crie um endpoint para consultar a média das grades de determinado subject e type. O endpoint deverá receber como parâmetro um subject e um type, e retornar a média. A média é calculada somando o registro value de todos os registros que possuem o subject e type informados, e dividindo pelo total de registros que possuem este mesmo subject e type.
 */

router.get("/average/:subject/:type", async (req, res, next) => {
    try {
        const getData = req.params;
        let averageTotal = 0;
        let count = 0;
        const fileGrades = JSON.parse(await readFile(global.fileName));

        let subject = fileGrades.grades.find(grade => {
            return grade.subject === getData.subject;
        });

        let type = fileGrades.grades.find(grade => {
            return grade.type === getData.type;
        });

        if (subject === undefined || type === undefined) {
            throw new Error("Um, ou os dois, desses parâmetros não existem!");
            res.send("Um, ou os dois, desses parâmetros não existem!");
        }

        fileGrades.grades.filter(grade => {
            if (grade.subject === getData.subject && getData.type === grade.type) {
                // console.log(grade.subject +" - "+grade.type)
                averageTotal += grade.value;
                ++count;
            }
        });

        // console.log(averageTotal);
        // console.log(count);
        console.log(averageTotal / count);

        res.send(`The average value for ${getData.subject} and ${getData.type} is: ${averageTotal / count}`);
    } catch (err) {
        next(err);
    }
});

/*
7. Crie um endpoint para retornar as três melhores grades de acordo com determinado subject e type. O endpoint deve receber como parâmetro um subject e um type retornar um array com os três registros de maior value daquele subject e type. A ordem deve ser do maior para o menor.
*/

router.get("/bestgrades/:subject/:type", async (req, res, next) => {
    try {
        const getData = req.params;
        let bestGrades = [];
        const fileGrades = JSON.parse(await readFile(global.fileName));

        let subject = fileGrades.grades.find(grade => {
            return grade.subject === getData.subject;
        });

        let type = fileGrades.grades.find(grade => {
            return grade.type === getData.type;
        });

        if (subject === undefined || type === undefined) {
            throw new Error("Um, ou os dois, desses parâmetros não existem!");
            res.send("Um, ou os dois, desses parâmetros não existem!");
        }

        fileGrades.grades.filter(grade => {
            if (grade.subject === getData.subject && getData.type === grade.type) {
                // console.log(grade.subject +" - "+grade.type)
                bestGrades.push(grade);
            }
        });

        console.log(bestGrades.sort((b, a) => a.value - b.value).slice(0, 3));
        res.send(`The three best grades ${JSON.stringify(bestGrades.sort((b, a) => a.value - b.value).slice(0, 3))}`);
    } catch (err) {
        next(err);
    }
});


router.use((err, req, res, next) => {
    console.log(err.message);
    res.status(400).send({ error: err.message });
});

export default router;