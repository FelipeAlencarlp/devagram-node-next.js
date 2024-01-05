import type { NextApiRequest, NextApiResponse } from 'next';
import type { RespostaPadraoMsg } from '../../../types/RespostaPadraoMsg';
import { UsuarioModel } from '../../../models/UsuarioModel';
import { validarTokenJWT } from '../../../middlewares/validarTokenJWT';
import { conectarMongoDb } from '../../../middlewares/conectarMongoDb';
import { PublicacaoModel } from '../../../models/PublicacaoModel';

const feedEndPoint = async (req : NextApiRequest, res : NextApiResponse<RespostaPadraoMsg | any>) => {
    try {
        if(req.method === 'GET') {
            // receber a informação do ID do usuário do feed
            if(req?.query?.id) {
                // validar se o usuário é válido
                const usuario = await UsuarioModel.findById(req?.query?.id);

                if(!usuario) {
                    return res.status(400).json({ erro : 'Usuário não encontrado' });
                }

                // buscando no banco de dados as informações
                const publicacoes = await PublicacaoModel
                    .find({ idUsuario : usuario._id })
                    .sort({ data : -1 }); // ordena da mais nova para mais antiga (decrescente)

                return res.status(200).json(publicacoes);
            }
        }

        return res.status(405).json({ erro : 'Método informado não é valido' })
    } catch(e) {
        console.log(e);
    }

    return res.status(400).json({ erro : 'Não foi possível obter o feed' });
}

export default validarTokenJWT(conectarMongoDb(feedEndPoint));