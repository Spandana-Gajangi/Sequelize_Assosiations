const express = require('express');
const httpContext = require('express-http-context');
const bodyParser = require('body-parser');
// const compress = require('compression');
const methodOverride = require('method-override');
const Sequelize = require('sequelize');

const app = express();

const sequelize = new Sequelize('postgres://postgres:postgres@localhost:5432/test_db', {force:true,freezeTableName: true });
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const User = sequelize.define('user', {
    name:{
        type: Sequelize.STRING(64)
    },
    teamId:{
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: 'team',
            key: 'id'
        }
    },
        teamId1:{
            type: Sequelize.INTEGER,
            allowNull: false,
            unique: true,
            references: {
                model: 'team',
                key: 'id'
            }
        },
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
        unique: true
    }
},{
        freezeTableName :true
    }
    );

const Team = sequelize.define('team', {
        name:{
            type: Sequelize.STRING(64)
        },
        coachId:{
            type:Sequelize.INTEGER,
            allowNull:false,
            references:{
                mode:'coach',
                key: 'id'
            }
        },
        id:{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
            unique: true
        }
        },
    {
        freezeTableName :true
    });

const Coach = sequelize.define('coach', {
        name:{
            type: Sequelize.STRING(64)
        },
        id:{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
            unique: true
        }
    },
    {
        freezeTableName :true
    });


User.belongsTo(Team,{as:'team', foreignKey:'teamId'});
User.belongsTo(Team,{as:'team1',foreignKey:'teamId1'});
Team.belongsTo(Coach, {foreignKey: 'coachId'});

const create = async () =>{
    const coach = await Coach.create({name: 'coach1'}, {raw:true});
    const coach1 = await Coach.create({name: 'coach2'}, {raw:true});
    const team = await Team.create({name: 'team1', coachId: coach.id}, {raw:true});
    const team1 = await Team.create({name: 'team2', coachId: coach1.id}, {raw:true});
    const user = await User.create({name:'user1', teamId: team.id,teamId1: team1.id}, {raw:true});
    return {user, team, coach,coach1};
}

const find = async (coachId, coachId1) =>{
    try {
        const user = await User.findAll({
            include: [{
                model: Team,
                as: 'team',
                attributes: [['name', 'teamName']],
                include: [Coach],
                where: {coachId},
            },
                {
                    model: Team,
                    as: 'team1',
                    attributes: [['name', 'teamName']],
                    include: [Coach],
                    where: {coachId:coachId1},
                }],
            raw: true
        });
        return user;
    }catch (e) {
        throw e;
    }
}

app.get('/',async(req,res)=>{
    const {team, user, coach, coach1} = await create();
    const result = await find(coach.id,coach1.id);
    res.json(result);
});

try {
    app.listen(3001, async() => {
        await sequelize.sync({force:true});
        console.log('server started on port 3001');
    })
}catch (e) {
    console.log('error', e);
a}
