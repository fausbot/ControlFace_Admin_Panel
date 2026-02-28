const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const axios = require("axios");
const cors = require('cors')({ origin: true });

// Secretos que configuraremos en Firebase
const githubToken = defineSecret("GITHUB_PAT");

exports.triggerGitHubDeploy = onRequest(
    { secrets: [githubToken] },
    (req, res) => {
        cors(req, res, async () => {
            // 1. Validar Método
            if (req.method !== 'POST') {
                return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
            }

            try {
                // En una app real, aquí validaríamos el Header de Autorización de Firebase Auth
                // Ej: const idToken = req.headers.authorization.split('Bearer ')[1];

                const { tenants } = req.body;

                if (!tenants || !Array.isArray(tenants) || tenants.length === 0) {
                    return res.status(400).json({ error: 'Debes proporcionar un array "tenants" válido.' });
                }

                logger.info(`Iniciando despliegue para ${tenants.length} tenants`, { tenants });

                // 2. Preparar el payload para GitHub
                // Convertimos el array a string JSON para pasárselo al input del Action
                const payloadStr = JSON.stringify(tenants);

                const GITHUB_REPO = "fausbot/ControlFace_Proyecto";
                const WORKFLOW_ID = "deploy-tenants.yml";

                const githubUrl = `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/${WORKFLOW_ID}/dispatches`;

                // 3. Disparar Petición a GitHub API
                const response = await axios.post(
                    githubUrl,
                    {
                        ref: "main", // Rama a compilar
                        inputs: {
                            tenants: payloadStr
                        }
                    },
                    {
                        headers: {
                            'Accept': 'application/vnd.github.v3+json',
                            'Authorization': `Bearer ${githubToken.value()}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                logger.info(`Respuesta de GitHub: ${response.status}`);

                return res.status(200).json({
                    message: 'Worklow de despliegue disparado exitosamente',
                    status: response.status
                });

            } catch (error) {
                logger.error("Error disparando GitHub Action", error);

                let errorMsg = 'Error interno del servidor';
                if (error.response) {
                    errorMsg = `GitHub API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
                }

                return res.status(500).json({ error: errorMsg });
            }
        });
    }
);
