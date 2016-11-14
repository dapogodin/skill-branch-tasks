export default function getSum(a, b) {
	if(!a)
    	a=0;
  	if(!b)
    	b=0;

  const sum = +a + +b;

  return sum.toString();
};