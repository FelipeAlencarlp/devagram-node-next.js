import type { NextApiResponse, NextApiRequest } from "next";
import type { RespostaPadraoMsg } from "../../../types/RespostaPadraoMsg";
import { validarTokenJWT } from "../../../middlewares/validarTokenJWT";
import { conectarMongoDb } from "../../../middlewares/conectarMongoDb";
import { PublicacaoModel } from "../../../models/PublicacaoModel";
import { UsuarioModel } from "../../../models/UsuarioModel";

const likeEndpoint =
    async (req : NextApiRequest, res : NextApiResponse<RespostaPadraoMsg>) => {
        try {
            if(req.method === 'PUT') {
                // id da publicação - checked
                const { id } = req?.query;
                const publicacao = await PublicacaoModel.findById(id);
                if(!publicacao) {
                    return res.status(400).json({ erro : 'Publicação não encontrada' });
                }

                // id do usuário que está curtindo
                const { userId } = req?.query;
                const usuario = await UsuarioModel.findById(userId);
                if(!usuario) {
                    return res.status(400).json({ erro : 'Usuário não encontrado' });
                }

                // administrar os likes
                const indexUsuarioNoLike =
                    publicacao.likes.findIndex((e : any) => e.toString() === usuario._id.toString())

                // se o index for > -1 (0/1) ele curte a publicação
                if(indexUsuarioNoLike != -1) {
                    publicacao.likes.splice(indexUsuarioNoLike, 1);
                    await PublicacaoModel.findByIdAndUpdate({ _id : publicacao._id }, publicacao);

                    return res.status(200).json({ msg : 'Publicação descurtida com sucesso' });
                } else {
                    // se o index for -1 o usuário não curte a publicação
                    publicacao.likes.push(usuario._id);
                    await PublicacaoModel.findByIdAndUpdate({ _id : publicacao._id }, publicacao);

                    return res.status(200).json({ msg : 'Publicação curtida com sucesso' });
                }
            }

            return res.status(405).json({ erro : 'Método informado não é válido' });            
        } catch(e) {
            console.log(e);
            return res.status(500).json({ erro : 'Erro ao curtir/descurtir uma publicação' });
        }
}

export default validarTokenJWT(conectarMongoDb(likeEndpoint));