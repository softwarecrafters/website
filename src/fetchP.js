const fetchP = url =>
  new Promise(resolve => {
    const cbName = `cb_${(Math.random() * 10000000) | 0}`;
    window[cbName] = (...args) => {
      delete window[cbName];
      resolve(...args);
    };
    const script = document.createElement('script');
    script.src = `${url}${cbName}`;
    document.body.appendChild(script);
  });

export default fetchP;
