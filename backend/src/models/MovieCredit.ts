import mongoose, { Schema, Document } from "mongoose";
import { MovieCredit } from "../types/movie.type";




export interface IMovieCredit extends MovieCredit, Document {};


const movieCreditSchema: Schema = new Schema(
    {
        cast: [{
            id:                     { type: Number, required: true, unique: true },
            name:                   { type: String, required: true },
            character:              { type: String, required: true },
            profile_path:           { type: String, unique: true },
            order:                  { type: Number, required: true },
            gender:                 { type: Number },
            known_for_department:   { type: String },
            popularity:             { type: Number },
            credit_id:              { type: String },
        }],
        crew: [{
             id:                    { type: Number, required: true, unique: true },
             name:                  { type: String, required: true },
             job:                   { type: String, required: true },
             department:            { type: String, required: true },
             profile_path:          { type: String },
             gender:                { type: Number },
             known_for_department:  { type: String },
             popularity:            { type: Number },
             credit_id:             { type: String },

        }]
    },
    {
        timestamps: false,
        _id: false,
        id: false,
    }
);


export default mongoose.model<IMovieCredit>("MovieCredit", movieCreditSchema);
// TODO: what will the collection be called?

