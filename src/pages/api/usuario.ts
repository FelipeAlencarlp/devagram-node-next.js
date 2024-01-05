import type { NextApiRequest, NextApiResponse } from 'next';
import type { RespostaPadraoMsg } from '../../../types/RespostaPadraoMsg';
import { UsuarioModel } from '../../../models/UsuarioModel';
import { validarTokenJWT } from '../../../middlewares/validarTokenJWT';
import { conectarMongoDb } from '../../../middlewares/conectarMongoDb';

const usuarioEndpoint = 
    async (req : NextApiRequest, res : NextApiResponse<RespostaPadraoMsg | any>) => {
    try {
        // pegando o id do usuario
        const { userId } = req?.query;
        const usuario = await UsuarioModel.findById(userId);
        usuario.senha = null;

        return res.status(200).json(usuario);
    } catch(e) {
        console.log(e);
    }
    
    return res.status(400).json({ erro: 'Não foi possível obter dados do usuário' });
}

export default validarTokenJWT(conectarMongoDb(usuarioEndpoint));