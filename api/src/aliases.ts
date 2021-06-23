import moduleAlias from 'module-alias';
import path from 'path';

const rootPath = path.resolve(__dirname, '..');
const rootPathProd = path.resolve(rootPath, 'dist');
moduleAlias.addAliases({
  'src':  rootPathProd,
});

