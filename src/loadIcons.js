export const loadIcons = async (map, dataSource) => {
  const featuresWithIcons = dataSource.data.features.filter(
    feature => !!feature.properties.icon
  );

  const allPromises = featuresWithIcons.map(
    feature =>
      new Promise((resolve, reject) => {
        map.loadImage(
          feature.properties.icon,
          (err, data) =>
            err
              ? reject(err)
              : resolve({ id: feature.properties.id, imageData: data })
        );
      })
  );

  const loadedIcons = [];
  for (let promise of allPromises) {
    try {
      loadedIcons.push(await promise);
    } catch (e) {
      console.error("Error while loading icon", e);
    }
  }

  loadedIcons.forEach(icon => {
    map.addImage(icon.id, icon.imageData);
  });
};
