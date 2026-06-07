const fetchP = url =>
  new Promise((resolve, reject) => {
    const cbName = `cb_${(Math.random() * 10000000) | 0}`;
    const script = document.createElement('script');

    const cleanup = () => {
      delete window[cbName];
      script.remove();
    };

    window[cbName] = (...args) => {
      cleanup();
      resolve(...args);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error(`Failed to load JSONP script: ${url}`));
    };

    script.src = `${url}${cbName}`;
    document.body.appendChild(script);
  });

export default fetchP;
