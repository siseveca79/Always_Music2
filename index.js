require('dotenv').config();
const { Pool } = require('pg');

// Configuración de la conexión con la base de datos
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Función para agregar un nuevo estudiante
async function agregarEstudiante(nombre, rut, curso, nivel) {
    const client = await pool.connect();
    try {
        // Validación de entrada de datos
        if (!nombre || !rut || !curso || !nivel) {
            throw new Error('Todos los campos son obligatorios');
        }

        // Uso de consulta preparada para evitar la inyección de SQL
        const query = {
            text: 'INSERT INTO estudiantes (nombre, rut, curso, nivel) VALUES ($1, $2, $3, $4)',
            values: [nombre, rut, curso, nivel]
        };

        // Ejecución de la consulta
        await client.query(query);
        console.log(`Estudiante ${nombre} agregado con éxito`);
    } catch (err) {
        console.error('Error al agregar estudiante:', err.message);
    } finally {
        client.release();
    }
}

// Función para consultar todos los estudiantes
async function consultarEstudiantes() {
    const client = await pool.connect();
    try {
        const query = {
            text: 'SELECT * FROM estudiantes'
        };
        const res = await client.query(query);
        console.log('Registro actual:', res.rows);
    } catch (err) {
        console.error('Error al consultar estudiantes:', err.message);
    } finally {
        client.release();
    }
}

// Función para consultar un estudiante por rut
async function consultarEstudiantePorRut(rut) {
    const client = await pool.connect();
    try {
        const query = {
            text: 'SELECT * FROM estudiantes WHERE rut = $1',
            values: [rut]
        };
        const res = await client.query(query);
        console.log('Estudiante encontrado:', res.rows);
    } catch (err) {
        console.error('Error al consultar estudiante por rut:', err.message);
    } finally {
        client.release();
    }
}

// Función para editar un estudiante
async function editarEstudiante(nombre, rut, curso, nivel) {
    const client = await pool.connect();
    try {
        // Validación de entrada de datos
        if (!nombre || !rut || !curso || !nivel) {
            throw new Error('Todos los campos son obligatorios');
        }

        // Uso de consulta preparada para evitar la inyección de SQL
        const query = {
            text: 'UPDATE estudiantes SET nombre = $1, curso = $2, nivel = $3 WHERE rut = $4',
            values: [nombre, curso, nivel, rut]
        };
        await client.query(query);
        console.log(`Estudiante ${nombre} editado con éxito`);
    } catch (err) {
        console.error('Error al editar estudiante:', err.message);
    } finally {
        client.release();
    }
}

// Función para eliminar un estudiante
async function eliminarEstudiante(rut) {
    const client = await pool.connect();
    try {
        // Uso de consulta preparada para evitar la inyección de SQL
        const query = {
            text: 'DELETE FROM estudiantes WHERE rut = $1',
            values: [rut]
        };
        await client.query(query);
        console.log(`Registro de estudiante con rut ${rut} eliminado`);
    } catch (err) {
        console.error('Error al eliminar estudiante:', err.message);
    } finally {
        client.release();
    }
}

// Ejecución de comandos desde la línea de comandos
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
        console.error('Error en la ejecución del comando:', err.message);
    } finally {
        await pool.end();
    }
})();
