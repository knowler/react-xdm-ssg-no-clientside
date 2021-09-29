const React = require('react');
const runtime = require('react/jsx-runtime.js');
const ReactDOMServer = require('react-dom/server');
const {existsSync} = require('fs');
const {opendir, mkdir, writeFile} = require('fs/promises');
const path = require('path');
const xdmRegister = require('xdm/lib/integration/require.cjs')

const remarkFrontmatter = import('remark-frontmatter');

require('@babel/register');

xdmRegister({
  ...runtime,
  remarkPlugins: [remarkFrontmatter],
});

const {Page} = require('./layouts/Page.js');

const writeHTML = async (filePath, Content) => await writeFile(
  filePath,
  ReactDOMServer.renderToStaticMarkup(
    React.createElement(
      Page,
      null,
      React.createElement(Content)
    )
  )
);

async function build(contentPath, outputPath) {
  if (!existsSync(outputPath)) {
    await mkdir(outputPath);
  }
  const dir = await opendir(contentPath);

  for await (const dirent of dir) {
    const direntContentPath = path.resolve(contentPath, dirent.name);
    const parsedPath = path.parse(direntContentPath);

    // Three scenairos: directory, index.md, or *.md
    if (dirent.isDirectory()) {

      await build(direntContentPath, path.join(outputPath, dirent.name));

    } else if (['index.md', 'index.mdx'].includes(dirent.name)) {

      const Content = require(direntContentPath);

      await writeHTML(path.resolve(outputPath, 'index.html'), Content);

    } else if (['.md', '.mdx'].includes(parsedPath.ext)) {

      const pageDir = path.join(outputPath, parsedPath.name);
      if (!existsSync(pageDir)) {
        await mkdir(pageDir);
      }

      const Content = require(direntContentPath);

      await writeHTML(path.join(pageDir, 'index.html'), Content);

    }
  }
}

build('./content', './public');
