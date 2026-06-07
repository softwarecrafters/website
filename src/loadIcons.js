const ICON_LOAD_TIMEOUT_MS = 5000;

export const loadIcons = async (map, dataSource) => {
  const featuresWithIcons = dataSource.data.features.filter(feature => !!feature.properties.icon);

  const loadIconWithTimeout = (feature, timeoutMs = ICON_LOAD_TIMEOUT_MS) =>
    new Promise(resolve => {
      let settled = false;
      const { icon } = feature.properties;

      const timeout = setTimeout(() => {
        if (settled) {
          return;
        }
        settled = true;
        console.warn('Timeout while loading icon', icon);
        resolve(null);
      }, timeoutMs);

      map.loadImage(icon, (err, data) => {
        if (settled) {
          return;
        }
        settled = true;
        clearTimeout(timeout);

        if (err || !data) {
          console.error('Error while loading icon', icon, err);
          resolve(null);
          return;
        }

        resolve({ id: feature.properties.id, imageData: data });
      });
    });

  const loadedIcons = (
    await Promise.all(featuresWithIcons.map(feature => loadIconWithTimeout(feature)))
  ).filter(Boolean);

  loadedIcons.forEach(icon => {
    if (!map.hasImage(icon.id)) {
      map.addImage(icon.id, icon.imageData);
    }
  });
};
