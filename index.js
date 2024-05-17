require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function agregarEstudiante(nombre, rut, curso, nivel) {
    const client = await pool.connect();
    try {
        await client.query('INSERT INTO estudiantes (nombre, rut, curso, nivel) VALUES ($1, $2, $3, $4)', [nombre, rut, curso, nivel]);
        console.log(`Estudiante ${nombre} agregado con éxito`);
    } catch (err) {
        console.error('Error al agregar estudiante:', err.stack);
    } finally {
        client.release();
    }
}

async function consultarEstudiantes() {
    const client = await pool.connect();
    try {
        const res = await client.query('SELECT * FROM estudiantes');
        console.log('Registro actual', res.rows);
    } catch (err) {
        console.error('Error al consultar estudiantes:', err.stack);
    } finally {
        client.release();
    }
}

async function consultarEstudiantePorRut(rut) {
    const client = await pool.connect();
    try {
        const res = await client.query('SELECT * FROM estudiantes WHERE rut = $1', [rut]);
        console.log(res.rows);
    } catch (err) {
        console.error('Error al consultar estudiante por rut:', err.stack);
    } finally {
        client.release();
    }
}

async function editarEstudiante(nombre, rut, curso, nivel) {
    const client = await pool.connect();
    try {
        await client.query('UPDATE estudiantes SET nombre = $1, curso = $2, nivel = $3 WHERE rut = $4', [nombre, curso, nivel, rut]);
        console.log(`Estudiante ${nombre} editado con éxito`);
    } catch (err) {
        console.error('Error al editar estudiante:', err.stack);
    } finally {
        client.release();
    }
}

async function eliminarEstudiante(rut) {
    const client = await pool.connect();
    try {
        await client.query('DELETE FROM estudiantes WHERE rut = $1', [rut]);
        console.log(`Registro de estudiante con rut ${rut} eliminado`);
    } catch (err) {
        console.error('Error al eliminar estudiante:', err.stack);
    } finally {
        client.release();
    }
}

const args = process.argv.slice(2);
const comando = args[0];

(async () => {
    try {
        if (comando === 'nuevo') {
            const [nombre, rut, curso, nivel] = args.slice(1);
            await agregarEstudiante(nombre, rut, curso, nivel);
        } else if (comando === 'consulta') {
            await consultarEstudiantes();
        } else if (comando === 'rut') {
            const rut = args[1];
            await consultarEstudiantePorRut(rut);
        } else if (comando === 'editar') {
            const [nombre, rut, curso, nivel] = args.slice(1);
            await editarEstudiante(nombre, rut, curso, nivel);
        } else if (comando === 'eliminar') {
            const rut = args[1];
            await eliminarEstudiante(rut);
        } else {
            console.log('Comando no reconocido');
        }
    } catch (err) {
        console.error('Error en la ejecución del comando:', err.stack);
    } finally {
        await pool.end();
    }
})();
