import zoid from "zoid";

const AuthentificationComp = zoid.create({
  // The html tag used to render my component

  tag: "experiment",

  // The url that will be loaded in the iframe or popup, when someone includes my component on their page

  url: "https://preprod.fouloscopie.com/experiment/1",

  // The size of the component on their page. Only px and % strings are supported

  dimensions: {
    width: "400px",
    height: "200px",
  },
});

export default AuthentificationComp;
