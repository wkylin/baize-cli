const links = new Map([
  ['React', 'https://github.com/wkylin/pro-react-admin.git'],
  ['VueJS', 'https://github.com/wkylin/pro-vue-admin.git'],
  ['NextJS', 'https://github.com/vercel/next.js/tree/canary/examples/hello-world'],
]);

export const getRepoUrl = (framework) => {
  return links.get(framework);
};

export default links;