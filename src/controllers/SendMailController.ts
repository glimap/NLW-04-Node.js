import { Request, Response } from "express";
import { resolve } from 'path';
import { title } from "process";
import { getCustomRepository } from "typeorm";
import { AppError } from "../errors/AppError";

import { SurveysRepository } from "../repositories/ServeysRepository";
import { SurveysUsersRepository } from "../repositories/SurveysUsersRepository";
import { UsersRepository } from "../repositories/UsersRepository";
import SendMailServices from "../services/SendMailServices";

class SendMailController {
    async execute(request: Request, response: Response) {
        const { email, survey_id } = request.body;
        
        const usersRepository = getCustomRepository(UsersRepository);
        const serveysRepository = getCustomRepository(SurveysRepository);
        const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);

        const user = await usersRepository.findOne({ email });

        if(!user) {
            throw new AppError("Survey User does not exists!");
        }

        const survey = await serveysRepository.findOne({
            id: survey_id, 
        });

        if(!survey) {
            throw new AppError("Survey User does not exists!");
        }

        const npsPath = resolve(__dirname, '..', 'views', 'emails', 'npsMail.hbs');

        const surveyUserAlredyExists = await surveysUsersRepository.findOne({
            where: { user_id: user.id, value: null },
            relations: ["user", "survey"]
        });

        const variables = {
            name: user.name,
            title: survey.title,
            description: survey.description,
            id: "",
            link: process.env.URL_MAIL,
        }

        if(surveyUserAlredyExists) {
            variables.id = surveyUserAlredyExists.id;
            await SendMailServices.execute(email, survey.title, variables, npsPath);
            return response.json(surveyUserAlredyExists);
        }

        const surveyUser = surveysUsersRepository.create({
            user_id: user.id,
            survey_id
        });
        
        await surveysUsersRepository.save(surveyUser);

        variables.id = surveyUser.id;
        
        await SendMailServices.execute(email, survey.title, variables, npsPath);

        return response.json(surveyUser);
    }
}

export { SendMailController }