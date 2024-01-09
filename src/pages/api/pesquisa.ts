import type { NextApiRequest, NextApiResponse } from "next";
import type { RespostaPadraoMsg } from "../../../types/RespostaPadraoMsg";
import { conectarMongoDb } from "../../../middlewares/conectarMongoDb";
import { validarTokenJWT } from "../../../middlewares/validarTokenJWT";
import { UsuarioModel } from "../../../models/UsuarioModel";
import { politicaCORS } from "../../../middlewares/politicaCORS";


const pesquisaEndPoint =
    async (req : NextApiRequest, res : NextApiResponse<RespostaPadraoMsg | any[]>) => {
        try {
            if(req.method === 'GET') {
                if(req?.query?.id) {
                    // faz a busca de todas as informações do usuário pelo id
                    const usuarioEncontrado = await UsuarioModel.findById(req?.query?.id);
                    if(!usuarioEncontrado) {
                        return res.status(400).json({ erro : 'Usuário não encontrado'});
                    }
                    usuarioEncontrado.senha = null;

                    return res.status(200).json(usuarioEncontrado);
                } else {
                    // faz a busca dos dados básicos do usuário
                    const { filtro } = req.query;
                    if(!filtro || filtro.length < 2) {
                        return res.status(400).json({ erro : 'A pesquisa precisa ter no mínimo 2 caracteres' });
                    }
    
                    // encontrar o usário pesquisado no banco de dados, por nome ou e-mail
                    const usuariosEncontrados = await UsuarioModel.find({
                        $or : [
                            { nome : { $regex : filtro, $options : 'i' }},
                            { email : { $regex : filtro, $options : 'i' }}
                        ]
                    });
    
                    return res.status(200).json(usuariosEncontrados);
                }
            }

            return res.status(405).json({ erro : 'Metódo informado não é válido'});
        } catch(e) {
            console.log(e);
            return res.status(500).json({ erro : 'Não foi possível buscar usuário: ' + e });
        }
}

export default politicaCORS(validarTokenJWT(conectarMongoDb(pesquisaEndPoint)));