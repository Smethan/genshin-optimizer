import { CardContent, Divider, MenuItem, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { CartesianGrid, ComposedChart, Line, ResponsiveContainer, Scatter, XAxis, YAxis, ZAxis } from 'recharts';
import CardLight from '../Components/Card/CardLight';
import DropdownButton from '../Components/DropdownMenu/DropdownButton';
import Stat from '../Stat';
export default function ChartCard({ data, plotBase, setPlotBase, statKeys }) {
  return <CardLight>
    <CardContent >
      <Box display="flex" alignItems="center" >
        <Typography variant="h6" mr={1}>Optimization Target vs</Typography>
        <DropdownButton title={plotBase ? Stat.getStatNameWithPercent(plotBase) : "Not Selected"} color={plotBase ? "success" : "primary"}>
          <MenuItem onClick={() => { setPlotBase("") }}>Unselect</MenuItem>
          <Divider />
          {statKeys.map(sKey => <MenuItem key={sKey} onClick={() => { setPlotBase(sKey) }}>{Stat.getStatNameWithPercent(sKey)}</MenuItem>)}
        </DropdownButton>
      </Box>
    </CardContent>
    <Divider />
    <CardContent>
      <Chart data={data} />
    </CardContent>
  </CardLight >
}

function Chart({ data }) {
  if (!data) return null
  let lastIndice = 0
  data.sort((a, b) => b.optimizationTarget - a.optimizationTarget)
  const init = data[0]
  data.map((ele, i) => {
    if (i === lastIndice) return data[i].minTarget = ele.optimizationTarget
    const last = data[lastIndice]
    if (ele.plotBase < last.plotBase) return false
    lastIndice = i
    return data[i].minTarget = ele.optimizationTarget
  })
  data.sort((a, b) => a.plotBase - b.plotBase)
  data[0].minTarget = init.optimizationTarget
  return <ResponsiveContainer width="100%" height={600}>
    <ComposedChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="plotBase" name="ER" unit="%" scale="linear" domain={['dataMin', 'dataMax']} />
      <YAxis name="DMG" domain={["auto", "auto"]} />
      <ZAxis range={[7, 7]} />
      <Scatter name="A school" dataKey="optimizationTarget" fill="#8884d8" line lineType="fitting" />
      <Line dataKey="minTarget" stroke="#ff7300" type="stepBefore" dot={false} connectNulls strokeWidth={2} />
    </ComposedChart >
  </ResponsiveContainer>
}