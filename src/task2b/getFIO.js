export default function getFIO(name) {
  console.log(`"${name}"`);

  const regName = new RegExp('^(\\s+)?([^0-9 _\/]+)(\\s+([^0-9 _\/]+))?(\\s+([^0-9 _\/]+))?$');
  
  
  if(!name || !regName.test(name))
    return 'Invalid fullname';

  const matches = name.match(regName);
  //console.log(matches);

  let result = '';

  if(matches[6])
    result = `${matches[6].slice(0,1).toUpperCase()}${matches[6].slice(1).toLowerCase()} ${matches[2].slice(0,1).toUpperCase()}. ${matches[4].slice(0,1).toUpperCase()}.`;
  else if(matches[4])
    result = `${matches[4].slice(0,1).toUpperCase()}${matches[4].slice(1).toLowerCase()} ${matches[2].slice(0,1).toUpperCase()}.`;
  else
    result = `${matches[2].slice(0,1).toUpperCase()}${matches[2].slice(1).toLowerCase()}`;
  
  return result;
};