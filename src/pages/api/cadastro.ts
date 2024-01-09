import type { NextApiRequest, NextApiResponse } from 'next';
import type { RespostaPadraoMsg } from '../../../types/RespostaPadraoMsg';
import type { CadastroRequisicao } from '../../../types/CadastroRequisicao';
import { UsuarioModel } from '../../../models/UsuarioModel';
import { conectarMongoDb } from '../../../middlewares/conectarMongoDb';
import md5 from 'md5';
import { upload, uploadImagemCosmic } from '../../../services/uploadImagemCosmic';
import nc from "next-connect";
import { politicaCORS } from '../../../middlewares/politicaCORS';

const handler = nc()
    .use(upload.single('file'))
    .post(async (req : NextApiRequest, res : NextApiResponse<RespostaPadraoMsg>) => {
        try {
            const usuario = req.body as CadastroRequisicao;

            if(!usuario.nome || usuario.nome.length < 2) {
                return res.status(400).json({ erro : 'Nome inválido' });
            }

            if(!usuario.email || usuario.email.length < 5
                || !usuario.email.includes('@')
                || !usuario.email.includes('.')) {
                return res.status(400).json({ erro : 'E-mail inválido' });
            }

            if(!usuario.senha || usuario.senha.length < 4) {
                return res.status(400).json({ erro : 'Senha inválida' });
            }

            // validação se já existe usuário com mesmo e-mail
            const usuariosComMesmoEmail = await UsuarioModel.find({ email : usuario.email });
            if(usuariosComMesmoEmail && usuariosComMesmoEmail.length > 0) {
                return res.status(400).json({ erro : 'Já existe uma conta com o e-mail informado' });
            }

            // enviar a imagem do multer para o cosmic
            const image = await uploadImagemCosmic(req);

            // salvar no banco de dados
            const usuarioASerSalvo = {
                nome : usuario.nome,
                email : usuario.email,
                senha : md5(usuario.senha),
                avatar: image?.media?.url
            };

            await UsuarioModel.create(usuarioASerSalvo);
            return res.status(200).json({ msg : 'Usuário criado com sucesso' });
        } catch (e) {
            console.log(e);
            return res.status(500).json({ erro: "Erro ao cadastrar o usuário" });
        }
});

export const config = {
    api : {
        bodyParser : false
    }
};

export default politicaCORS(conectarMongoDb(handler));