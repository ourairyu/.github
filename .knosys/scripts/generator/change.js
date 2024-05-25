const { pick } = require('@ntks/toolbox');

const { ensureDirExists, getImageFileNames, readReadMe, sortByName, sortByDate, readData, saveData, cp, getSiteRoot, getLocalDocRoot } = require('../helper');
const { readMetadata, createGenerator } = require('./helper');

const collectionName = 'changes';

function getLocalPostRoot() {
  return `${getSiteRoot()}/source/_posts`;
}

function getRefPostItemDir(blogRootPath, { year, month, slug }) {
  return `${blogRootPath}/posts/${year}/${month}/${slug}`;
}

function getRefPostMetadata(blogRootPath, pathParams) {
  const itemDir = getRefPostItemDir(blogRootPath, pathParams);

  return { ...readData(`${itemDir}/metadata.yml`), content: readReadMe(itemDir) };
}

function initCache(cache) {
  cache.monthlyPosts = {};

  ensureDirExists(getLocalPostRoot());
}

function resolveDate(itemDate) {
  const date = (new Date(itemDate)).getDate();

  return date > 9 ? date : '0' + date;
}

function cacheMonthlyPosts(cache, postData, { year, month }) {
  if (!cache.monthlyPosts[year]) {
    cache.monthlyPosts[year] = {};
  }

  if (!cache.monthlyPosts[year][month]) {
    cache.monthlyPosts[year][month] = [];
  }

  cache.monthlyPosts[year][month].push(postData);
}

function resolveBannerUrl(itemDir, callback) {
  getImageFileNames(itemDir).forEach(fileName => fileName.split('.')[0] === 'banner' && callback(fileName));
}

function resolvePostData(blogRootPath, slug, item, params, cache, { itemDir }) {
  let postData;

  if (item.ref) {
    const refPost = getRefPostMetadata(blogRootPath, params);

    postData = { ...pick(refPost, ['title', 'description', 'date', 'categories', 'tags', 'content']), external: true };

    if (refPost.banner) {
      const imageDirName = `changes/${[params.year, params.month, resolveDate(postData.date)].join('')}`;
      const sourceImageDir = getRefPostItemDir(blogRootPath, params);
      const distImageDir = `${getLocalDocRoot()}/${imageDirName}`;

      ensureDirExists(distImageDir, true);

      resolveBannerUrl(sourceImageDir, fileName => {
        postData.banner = { ...refPost.banner, url: `${imageDirName}/${fileName}` };

        cp(`${sourceImageDir}/${fileName}`, `${distImageDir}/${fileName}`);
      });
    }
  } else {
    const content = readReadMe(itemDir);

    postData = { ...pick(item, ['title', 'date', 'description', 'image', 'banner', 'categories', 'tags', 'series']), content };

    resolveBannerUrl(itemDir, fileName => {
      postData.banner.url = postData.banner.url.replace('/banner', `/${fileName}`);
      postData.image = postData.image.replace('/banner', `/${fileName}`);
    });

    cache.postContent = content;
  }

  postData.id = slug;

  cacheMonthlyPosts(cache, postData, params);

  return postData;
}

function generateMarkdown(slug, item, _, cache, { itemDir }) {
  if (!item || item.external) {
    return;
  }

  const fileNames = getImageFileNames(itemDir);
  const resolvedContent = cache.postContent
    .replace(new RegExp('{:target="_blank"}{:rel="external nofollow"}', 'g'), '')
    .replace(/{{ '([^']+)' \| asset_path }}/g, (_, imgPath) => {
      const parts = imgPath.split('/');
      const namePartial = parts.pop();
      const nameFull = fileNames.find(fileName => fileName.split('.').slice(0, -1).join('.') === namePartial);

      return `/knosys/${parts.concat(nameFull).join('/')}`;
    });

  let frontMatter = ['---', readMetadata(itemDir, true), '---'].join('\n');

  resolveBannerUrl(itemDir, fileName => (frontMatter = frontMatter.replace(/changes\/\d{8}\/banner/g, matched => ('knosys/' + matched.replace(/\/banner/, `/${fileName}`)))));
  saveData(`${getLocalPostRoot()}/${slug}.md`, `${[frontMatter, '', resolvedContent].join('\n')}\n`);
}

function resolveDocData(items, { monthlyPosts }) {
  const sequence = [];
  const years = {};

  sortByName(Object.keys(monthlyPosts)).forEach(year => {
    years[year] = 0;

    sortByName(Object.keys(monthlyPosts[year])).forEach(month => {
      const ids = sortByDate(monthlyPosts[year][month]).map(p => p.id);

      years[year] += ids.length;

      sequence.push(...ids);
    });
  });

  return { items, sequence, years }
}

module.exports = {
  createChangeGenerator: (sourceRootPath, sharedRootPath) => createGenerator(sourceRootPath, sharedRootPath, collectionName, {
    paramPath: 'year/month/slug',
    metadataRequired: true,
    removeWhenLocalImageDirExists: false,
    getItemImageDir: ({ date }, { year, month }, { imageDir }) => `${imageDir}/${[year, month, resolveDate(date)].join('')}`,
    getItemImageSourceDir: null,
    transformItem: resolvePostData.bind(null, `${sourceRootPath}/blog`),
    transformData: resolveDocData,
    beforeRead: initCache,
    readEach: generateMarkdown,
  }),
};
