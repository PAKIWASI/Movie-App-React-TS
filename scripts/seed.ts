import mongoose from "mongoose";
import dotenv from "dotenv";
import movieModel from "./src/models/Movie";
import creditModel from "./src/models/MovieCredit";
import { MovieDetailsSchema, MovieCreditsSchema } from "./src/types/movie.type";

dotenv.config();

// ── Config ────────────────────────────────────────────────────────────────────

const TMDB_API_KEY  = process.env.VITE_TMDB_API_KEY as string;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TOTAL_PAGES   = 2;   // 20 movies per page
const MAX_CAST      = 20;
const IMPORTANT_CREW_JOBS = new Set([
    "Director",
    "Producer",
    "Screenplay",
    "Writer",
    "Director of Photography",
]);


// ── TMDB fetch helpers ────────────────────────────────────────────────────────

async function fetchPopularMovieIds(page: number): Promise<number[]> {
    const res  = await fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}`);
    const data = await res.json();
    return data.results.map((m: any) => m.id);
}

async function fetchMovieDetail(id: number): Promise<unknown> {
    const res = await fetch(`${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&language=en-US`);
    return res.json();
}

async function fetchMovieCredits(id: number): Promise<unknown> {
    const res = await fetch(`${TMDB_BASE_URL}/movie/${id}/credits?api_key=${TMDB_API_KEY}`);
    return res.json();
}


// ── Transformers ──────────────────────────────────────────────────────────────

function trimCredits(raw: any) {
    return {
        id:   raw.id,
        cast: raw.cast
            .sort((a: any, b: any) => a.order - b.order)
            .slice(0, MAX_CAST)
            .map(({ adult, cast_id, original_name, ...rest }: any) => rest),
        crew: raw.crew
            .filter((m: any) => IMPORTANT_CREW_JOBS.has(m.job))
            .map(({ adult, original_name, ...rest }: any) => rest),
    };
}


// ── Main ──────────────────────────────────────────────────────────────────────

async function seed() {

    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("Connected to MongoDB");

    let inserted = 0;
    let skipped  = 0;
    let failed   = 0;

    for (let page = 1; page <= TOTAL_PAGES; page++) {
        console.log(`\n=== Page ${page} ===`);

        const ids = await fetchPopularMovieIds(page);

        for (const id of ids) {
            console.log(`--- Movie ID: ${id} ---`);

            // ── fetch ──
            const [rawDetail, rawCredits] = await Promise.all([
                fetchMovieDetail(id),
                fetchMovieCredits(id),
            ]);

            // ── validate detail ──
            const detailResult = MovieDetailsSchema.safeParse(rawDetail);
            if (!detailResult.success) {
                console.error(`  [SKIP] Detail validation failed for ${id}:`);
                detailResult.error.issues.forEach(i =>
                    console.error(`    ${i.path.join(".")}: ${i.message}`)
                );
                failed++;
                continue;
            }

            // ── validate credits ──
            const trimmed       = trimCredits(rawCredits);
            const creditResult  = MovieCreditsSchema.safeParse(trimmed);
            if (!creditResult.success) {
                console.error(`  [SKIP] Credits validation failed for ${id}:`);
                creditResult.error.issues.forEach(i =>
                    console.error(`    ${i.path.join(".")}: ${i.message}`)
                );
                failed++;
                continue;
            }

            // ── insert ──
            try {
                await Promise.all([
                    movieModel.create(detailResult.data),
                    creditModel.create({ id, ...creditResult.data }),
                ]);
                console.log(`  [OK] ${detailResult.data.title}`);
                inserted++;
            } catch (err: any) {
                if (err.code === 11000) {
                    console.log(`  [SKIP] Already exists: ${id}`);
                    skipped++;
                } else {
                    console.error(`  [ERROR] Insert failed for ${id}:`, err.message);
                    failed++;
                }
            }
        }
    }

    console.log(`
════════════════════════════════
  Seed complete
  Inserted : ${inserted}
  Skipped  : ${skipped}  (already in DB)
  Failed   : ${failed}
════════════════════════════════`);

    await mongoose.disconnect();
}

seed().catch(err => {
    console.error("Seed crashed:", err);
    process.exit(1);
});
