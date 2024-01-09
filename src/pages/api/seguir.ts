import type { NextApiRequest, NextApiResponse } from "next";
import type { RespostaPadraoMsg } from "../../../types/RespostaPadraoMsg";
import { validarTokenJWT } from "../../../middlewares/validarTokenJWT";
import { conectarMongoDb } from "../../../middlewares/conectarMongoDb";
import { UsuarioModel } from "../../../models/UsuarioModel";
import { SeguidorModel } from "../../../models/SeguidorModel";
import { politicaCORS } from "../../../middlewares/politicaCORS";


const seguirEndpoint =
    async (req : NextApiRequest, res : NextApiResponse<RespostaPadraoMsg>) => {
        try {
            if(req.method === 'PUT') {
                const { userId, id} = req?.query;

                // usuário logado/autenticado
                const usuarioLogado = await UsuarioModel.findById(userId);
                if(!usuarioLogado) {
                    return res.status(400).json({ erro : 'Usuário logado não encontrado'});
                }

                // id do usuário a ser seguido
                const usuarioASerSeguido = await UsuarioModel.findById(id);
                if(!usuarioASerSeguido) {
                    return res.status(400).json({ erro : 'Usuário a ser seguido não encontrado' });
                }

                // buscar se Eu Logado sigo ou não esse usuário
                const euJaSigoEsseUsuario =
                    await SeguidorModel.find({ usuarioId : usuarioLogado._id, usuarioSeguidoId : usuarioASerSeguido._id });

                if(euJaSigoEsseUsuario && euJaSigoEsseUsuario.length > 0) {
                    // sinal que eu já sigo esse usuário
                    // utilizando o método forEach() async para melhorar a performance
                    euJaSigoEsseUsuario.forEach(async (e : any) =>
                        await SeguidorModel.findByIdAndDelete({ _id : e._id }));

                    // diminuir um seguindo no usuário logado
                    usuarioLogado.seguindo--;
                    await UsuarioModel
                        .findByIdAndUpdate({ _id : usuarioLogado._id }, usuarioLogado);

                    // diminuir um seguidor no usuário seguido
                    usuarioASerSeguido.seguidores--;
                    await UsuarioModel
                        .findByIdAndUpdate({ _id : usuarioASerSeguido._id }, usuarioASerSeguido);

                    return res.status(200).json({ msg : 'Deixou de seguir o usuário com sucesso' });
                } else {
                    // sinal que eu não sigo esse usuário
                    const seguidor = {
                        usuarioId : usuarioLogado._id,
                        usuarioSeguidoId : usuarioASerSeguido._id
                    }
                    await SeguidorModel.create(seguidor);

                    // adicionar um seguindo no usuário logado
                    usuarioLogado.seguindo++;
                    await UsuarioModel
                        .findByIdAndUpdate({ _id : usuarioLogado._id }, usuarioLogado);

                    // adicionar um seguidor no usuário seguido
                    usuarioASerSeguido.seguidores++;
                    await UsuarioModel
                        .findByIdAndUpdate({ _id : usuarioASerSeguido._id }, usuarioASerSeguido);

                    return res.status(200).json({ msg : 'Usuário seguido com sucesso' });
                }
            }

            return res.status(405).json({ erro : 'Método informado não é válido'});
        } catch(e) {
            console.log(e);
            return res.status(500).json({ erro : 'Não foi possível seguir/deseguir o usuário'});
        }
}

export default politicaCORS(validarTokenJWT(conectarMongoDb(seguirEndpoint)));