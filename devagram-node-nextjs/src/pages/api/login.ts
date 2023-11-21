import type { NextApiRequest, NextApiResponse } from 'next';
import { conectarMongoDb } from '../../../middlewares/conectarMongoDb';
import type { RespostaPadraoMsg } from '../../../types/RespostaPadraoMsg';
import md5 from 'md5';
import { UsuarioModel } from '../../../models/UsuarioModel';

const endpointLogin = async (
    req : NextApiRequest,
    res : NextApiResponse<RespostaPadraoMsg>
) => {
    if(req.method === 'POST') {
        const {login, senha} = req.body;

        const usuariosEncontrados = await UsuarioModel.find({ email : login, senha : md5(senha) });
        if(usuariosEncontrados && usuariosEncontrados.length > 0) {
            const usuarioEncontrado = usuariosEncontrados[0];
            return res.status(200).json({ msg : `Usuário ${usuarioEncontrado.nome} autenticado com sucesso.` });
        }
        return res.status(400).json({ erro : 'Usuário ou Senha não encontrado!' });
    }
    return res.status(405).json({ erro : 'Método informado é inválido!'});
}

export default conectarMongoDb(endpointLogin);