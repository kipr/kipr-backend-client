import { Rest } from '../src/index';

const rest = new Rest();

const user = await rest.login('', '');
const project = await user.projects.open('asdasd');
const version = await project.versions.open('asdasdds');
const files = await version.files.list();

for (const brief of files) {
  const file = await brief.open();
  await file.close();
}

//  await file.update('asdasdsad');
