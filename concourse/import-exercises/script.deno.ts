import { readCSVObjects } from 'https://deno.land/x/csv/mod.ts';
import { assertDefined } from '../../src/app/utils/assertions.ts';

/*
 * ideally, i think, we would crawl book content, identify exercises, fetch their data from the api, and use that for practice.
 * in a perfect world we could do that on the fly, from the content loaded in a browser.
 *
 * currently we have these issues:
 * - problems in the end of chapter are not linked to their source page in any way in the final content
 * - in the content, problems from the exercises api are indistinguishable from problems that are simply part of the content
 *   - as a function of that, there are no identifiers for the problem, such as group_uuid or version or uid
 * - we can't load data on the fly from the browser because there is no mechanic for "public answers" in the exercises
 *   api, we have to use an authorized user here and our own domain knowledge of which answers have been published.
 *
 * the workaround is that tom has a brutal hack that alters the exercise template to include attributes about the data
 * source (exercise api data and current page) during baking. after running this locally there is another script that searches
 * the baked output and find the exercises on their new pages. at that point the information necessary to decide if the
 * problem should be used for practice (number, final page, source page, exercise tags) are known and can be used to
 * generate the csv that input to this script.
 */

const Authorization = assertDefined(Deno.env.get('EXERCISES_AUTHORIZATION'), 'EXERCISES_AUTHORIZATION environment variable must be set');
const csvPath = assertDefined(Deno.env.get('CSV_FILE'), 'CSV_FILE environment variable must be set');

// only physics has practice right now, probably add this to the csv in the future
const bookId = 'cce64fde-f448-43b8-ae88-27705cceb0da';

const f = await Deno.open(csvPath);

const pages: {[key: string]: any[]} = {};

for await (const row of readCSVObjects(f)) {
  console.log(`fetching ${row.group_uuid}`);

  const exercise = await fetch(`https://exercises.openstax.org/api/exercises/${row.group_uuid}`, {
    headers: {
      Authorization,
    },
  })
    .then((response) => response.json())
  ;

  (pages[row.source_page] = pages[row.source_page] || []).push({
    answers: exercise.questions[0].answers,
    group_uuid: exercise.group_uuid,
    stem_html: exercise.questions[0].stem_html,
    tags: exercise.group_uuid,
    uid: exercise.uid,
  });

}

f.close();

for (const [sourceId, problems] of Object.entries(pages)) {
  console.log(`writing ${sourceId}`);

  Deno.writeTextFileSync(
    `data/practice/questions/${bookId}/${sourceId}.json`,
    JSON.stringify(problems, null, 2)
  );
}
