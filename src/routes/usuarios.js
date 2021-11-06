const bcrypt = require("bcrypt");

module.exports = app =>{

    const Usuario = app.db.models.Usuarios;
    const bcrypt = require('bcrypt');
    const Sequelize = require("sequelize");
    const BCRYPT_SALT_ROUNDS = 10;

    app.route('/api/usuario')

        .get((req,res)=>{
            const whereCondition = {};
            if(req.query.usuario){
                Object.assign(whereCondition, {
                    usuario: Sequelize.where(Sequelize.col('usuario'), 'LIKE', '%'+ req.query.usuario +'%')
                });
            }
            if(req.query.rol){
                Object.assign(whereCondition, {
                    rol: Sequelize.where(Sequelize.col('rol'), 'LIKE', '%'+ req.query.rol +'%')
                });
            }
            /*if(req.query.activo){
                Object.assign(whereCondition, {
                    activo: req.query.activo
                });
            }*/

            const order = req.query.order ? req.query.order.split(",",2) : [];

            Usuario.findAndCountAll({
                where: whereCondition,
                limit: req.query.limit,
                offset: req.query.offset * req.query.limit,
                order: [order],
                attributes: { exclude: ['password'] }
            })
                .then(result => res.json(result))
                .catch(error =>{
                    res.status(412).json({msg: error.message});
                });
        })

        .post((req,res)=>{
            req.body.activo = true;
            bcrypt.hash(req.body.password, BCRYPT_SALT_ROUNDS)
                .then(hashedPassword =>{
                    req.body.password = hashedPassword;
                    Usuario.create(req.body)
                        .then(result => {
                            res.json(result);
                            console.log(result);
                        })
                        .catch(error => {
                            res.status(412).json({msg:error.message});
                            console.log('Error dentro del create ', error);
                        });
                })
                .catch(error => {
                    res.status(412).json({msg:error.message});
                    console.log('Error en la encriptacion ', error);
                });

        })


        .put((req,res)=>{
            Usuario.update(req.body,{where: {id: req.body.id}})
                .then(result => res.json(result))
                .catch(error =>{
                    res.status(412).json({msg: error.message});
                })
        });

    app.route('/api/usuario/:id')

        .get((req,res)=>{
            Usuario.findOne({
                where: req.params,
                attributes: { exclude: ['password'] }
                })
                .then((result)=> {
                    res.json(result)
                })
                .catch(error =>{
                    res.status(412).json({msg:error.message})
                })
        })

        .delete((req,res) => {
            Usuario.destroy({where: req.params})
                .then(result=> res.sendStatus(204))
                .catch(error => {
                    res.status(412).json({msg:error.message});
                })

        })
    app.route('/api/login')
        .get((req,res)=>{

            Usuario.findOne({where: {usuario: req.body.usuario}})
                .then(user =>{
                    return bcrypt.compare(req.body.password, user.password);
                })
                .then(result=>{
                    if(!result){
                        res.status(403).json({msg:'Pass incorrecta'})
                    }
                    res.send(result);
                })
                .catch(error =>{
                    res.status(412).json({msg:error.message})
                })
        })

    app.route('/api/cambiarclave')
        .patch((req,res)=>{
                bcrypt.hash(req.body.password, BCRYPT_SALT_ROUNDS)
                    .then(hashedPassword => {
                        req.body.password = hashedPassword;
                        Usuario.update(req.body,{where: {id: req.body.id}})
                            .then(result => res.json(result))
                            .catch(error => {
                                res.status(412).json({msg: error.message});
                            });
                    })
                    .catch(error => {
                        res.status(412).json({msg:error.message});
                        console.log('Error en la encriptacion ', error);
                    });

        })

}
