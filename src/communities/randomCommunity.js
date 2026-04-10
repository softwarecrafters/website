import communities from '../../communities.json';

export default () => communities[(Math.random() * communities.length) | 0].location.coordinates;
