export default function getUserName(name) {
    console.log(`"${name}"`);

    const nameSplit = name.split('/');
    if (nameSplit.length > 4)
        name = nameSplit.slice(0, 4).join('/');
    //console.log(name);

    const regName = new RegExp('^(\\s+)?((.+)?/+)?@?([-A-z0-9_.]+)(/.+)?(\\?(.+)?)?(\\s+)?$');
    let result = 'Invalid username';

    if (!name || !regName.test(name))
        return result;

    const matches = name.match(regName);
    //console.log(matches);

    if (matches[4])
        result = `@${matches[4]}`;

    return result;
};