from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error

app = Flask(__name__)
CORS(app)

CAMPOS_JOGADORES = [
    "ponta_esquerda", "centroavante", "ponta_direita",
    "meia_esquerda", "volante", "meia_direita",
    "lateral_esquerdo", "zagueiro_esquerdo", "zagueiro_direito",
    "lateral_direito", "goleiro"
]
CAMPOS = ["nome"] + CAMPOS_JOGADORES

def conectar_banco():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="camisa_10_basico"
    )

@app.get("/times")
def listar_times():
    conexao = None
    cursor = None
    try:
        conexao = conectar_banco()
        cursor = conexao.cursor(dictionary=True)
        cursor.execute(
            "SELECT id, nome, ponta_esquerda, centroavante, ponta_direita, "
            "meia_esquerda, volante, meia_direita, lateral_esquerdo, "
            "zagueiro_esquerdo, zagueiro_direito, lateral_direito, goleiro "
            "FROM times ORDER BY id DESC"
        )
        return jsonify(cursor.fetchall()), 200
    except Error:
        return jsonify({"erro": "Não foi possível consultar o banco de dados."}), 500
    finally:
        if cursor:
            cursor.close()
        if conexao and conexao.is_connected():
            conexao.close()

@app.post("/times")
def cadastrar_time():
    dados = request.get_json(silent=True)
    if not isinstance(dados, dict):
        return jsonify({"erro": "Envie os dados em formato JSON."}), 400

    valores = [str(dados.get(campo, "")).strip() for campo in CAMPOS]
    if any(not valor for valor in valores):
        return jsonify({"erro": "Preencha o nome do time e os onze jogadores."}), 400

    conexao = None
    cursor = None
    try:
        conexao = conectar_banco()
        cursor = conexao.cursor()
        placeholders = ", ".join(["%s"] * len(CAMPOS))
        colunas = ", ".join(CAMPOS)
        cursor.execute(
            f"INSERT INTO times ({colunas}) VALUES ({placeholders})",
            valores
        )
        conexao.commit()
        return jsonify({"mensagem": "Time cadastrado com sucesso.", "id": cursor.lastrowid}), 201
    except Error:
        if conexao:
            conexao.rollback()
        return jsonify({"erro": "Não foi possível cadastrar o time no banco de dados."}), 500
    finally:
        if cursor:
            cursor.close()
        if conexao and conexao.is_connected():
            conexao.close()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
