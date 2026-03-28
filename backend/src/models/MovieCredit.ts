import { Schema, Document } from "mongoose";
import { MovieCredit } from "../types/movie.type";




export interface IMovieCredit extends MovieCredit, Document {};


const movieCreditSchema: Schema = new Schema(
    {

    },
    {

    }
);
