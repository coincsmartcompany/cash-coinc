import express from "express"
import cors from "cors"
import mysql from "mysql2"

const { DB_USER, DB_PASSWORD, DB_HOST, DB_NAME } = process.env

const server = express()
const port = 3333

server.use(cors())
server.use(express.json())

// criar uma rota exatamente como essa para enviar o histórico para o site do pai
server.get("/metas", (request, response) => {
    const searchCommand = `
        SELECT * FROM metas
    `

    db.query(searchCommand, (error, metas) => {
        if(error) {
            console.log(error)
            return
        }

        response.json(metas)
    })
})

server.get("/historico", (request, response) => {
    const searchCommand = `
        SELECT * FROM historico
    `

    db.query(searchCommand, (error, historico) => {
        if(error) {
            console.log(error)
            return
        }

        response.json(historico)
    })
})

server.post("/metas", (request, response) => {
    const { meta } = request.body

    const insertCommand = `
        INSERT INTO metas(name, value)
        VALUES(?, ?)
    `

    db.query(insertCommand, [meta.name, meta.value], (error) => {
        if(error) {
            console.log(error)
            return
        }

        response.status(201).json({ message: "Meta criada com sucesso!" })
    })
})

server.delete("/metas", (request, response) => {
    const { id } = request.body

    const deleteCommand = `
        DELETE FROM metas
        WHERE id = ?
    `

    db.query(deleteCommand, [id], (error) => {
        if(error) {
            console.log(error)
            return
        }

        response.json({ message: "Meta apagada com sucesso!" })
    })
})

server.get("/saldo", (request, response) => {
    const searchCommand = `
        SELECT * FROM historico
    `

    db.query(searchCommand, (error, operations) => {
        if(error) {
            console.log(error)
            return
        }

        let saldoMeta = 0
        let saldoEconomia = 0

        operations.map(operation => {
            if(operation.operation === "deposit") {
                if (operation.meta === "") {
                    saldoEconomia += Number(operation.value)
                } else {
                    saldoMeta += Number(operation.value)
                }
                
                return
            }

            if (operation.meta === "") {
                saldoEconomia -= Number(operation.value)
            } else {
                saldoMeta -= Number(operation.value)
            }
        })

        console.log({
            saldoMeta,
            saldoEconomia,
            saldoTotal: saldoMeta + saldoEconomia
        })

        response.json({
            saldoMeta,
            saldoEconomia,
            saldoTotal: saldoMeta + saldoEconomia
        })
    })
})

// guardando saques e depósitos no histórico de operações
server.post("/historico", (request, response) => {
    const { operation } = request.body

    const insertCommand = `
        INSERT INTO historico(value, operation, meta)
        VALUES(?, ?, ?)
    `

    db.query(insertCommand, [operation.value, operation.operation, operation.meta], (error) => {
        if(error) {
            console.log(error)
            return
        }

        response.status(201).json({ message: "Registro criado com sucesso!" })
    })
})

server.listen(port, () => {
    console.log(`Servidor rodando na porta: ${port}!`)
})

const db = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    connectionLimit: 10
})