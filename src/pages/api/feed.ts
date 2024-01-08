import type { NextApiRequest, NextApiResponse } from 'next';
import type { RespostaPadraoMsg } from '../../../types/RespostaPadraoMsg';
import { UsuarioModel } from '../../../models/UsuarioModel';
import { validarTokenJWT } from '../../../middlewares/validarTokenJWT';
import { conectarMongoDb } from '../../../middlewares/conectarMongoDb';
import { PublicacaoModel } from '../../../models/PublicacaoModel';
import { SeguidorModel } from '../../../models/SeguidorModel';

const feedEndPoint = 
    async (req : NextApiRequest, res : NextApiResponse<RespostaPadraoMsg | any>) => {
    try {
        if(req.method === 'GET') {
            // retorna o feed do Usuário Logado
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
            } else {
                // retorna o feed principal do Usuário Logado e o feed dos usuários que ele segue
                const { userId } = req.query;
                const usuarioLogado = await UsuarioModel.findById(userId);

                if(!usuarioLogado) {
                    return res.status(400).json({ erro : 'Usuário não encontrado' });
                }

                const seguidores =
                    await SeguidorModel.find({ usuarioId : usuarioLogado._id });

                // transformando a variavel seguidores em um segundo Array 
                // para trazer a publicação de quem sigo
                const seguidoresIds = seguidores.map(s => s.usuarioSeguidoId);
                // trazendo as minhas publicações e de quem sigo
                const publicacoes = await PublicacaoModel.find({
                    $or : [
                        { idUsuario : usuarioLogado._id },
                        { idUsuario : seguidoresIds }
                    ]
                })
                .sort({ data : -1 }); // ordena por data mais recente

                // pegando informações especificas do usuário que publicou
                const resultado = [];
                for (const publicacao of publicacoes) {
                    const usuarioDaPublicacao = await UsuarioModel.findById(publicacao.idUsuario);

                    if(usuarioDaPublicacao) {
                        const final = {...publicacao._doc, usuario : {
                            nome : usuarioDaPublicacao.nome,
                            avatar : usuarioDaPublicacao.avatar
                        }};
                        resultado.push(final);
                    }
                }

                return res.status(200).json(resultado);
            }
        }

        return res.status(405).json({ erro : 'Método informado não é valido' })
    } catch(e) {
        console.log(e);
    }

    return res.status(400).json({ erro : 'Não foi possível obter o feed' });
}

export default validarTokenJWT(conectarMongoDb(feedEndPoint));