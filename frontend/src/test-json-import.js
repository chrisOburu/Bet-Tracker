// Test file to verify JSON import works
import arbitrageData from '../backend/data/arbitrage_opportunities.json';

console.log('Total arbitrage opportunities:', arbitrageData.length);
console.log('First opportunity:', arbitrageData[0]);

export default arbitrageData;
