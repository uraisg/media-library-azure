import { useState } from 'react'
import { Button } from 'react-bootstrap'
import { BarChartLine, GraphUp, ChevronRight } from 'react-bootstrap-icons'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import PropTypes from 'prop-types'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const options = {
  responsive: true
};

const BarGraph = (props) => {
  return (<Bar options={options} data={props.data} height={150} />)
}

const LineGraph = (props) => {
  return (<Line options={options} data={props.data} height={150} />)
}

const ActivityChart = (props) => {
  //0 -- Bar Graph
  //1 -- Line Graph
  const [graphType, setGraphType] = useState(0)

  const labels = props.activity.Month;
  const data = {
    labels,
    datasets: [
      {
        label: 'Upload',
        data: props.activity.Upload,
        backgroundColor: [
          '#2F4858'
        ],
        borderColor: [
          '#2F4858',
        ],
        borderWidth: 1
      },
      {
        label: 'Download',
        data: props.activity.Download,
        backgroundColor: [
          '#F26419'
        ],
        borderColor: [
          '#F26419'
        ],
        borderWidth: 1
      },
    ],
  };

  const handleSelect = (e) => {
    const upload = fetch(`/api/activity/graph/upload/${props.planningArea}/${e.target.value}`, {
        mode: 'same-origin',
        credentials: 'same-origin',
    })

    const download = fetch(`/api/activity/graph/download/${props.planningArea}/${e.target.value}`, {
      mode: 'same-origin',
      credentials: 'same-origin',
    })

    Promise.all([upload, download])
      .then(results => {
        results[0].json()
          .then(data => {
            results[1].json()
              .then(data2 => {
                const dataMonth = getMonthArray(data, data2)
                const dataCountUpload = getCountArray(dataMonth, data)
                const dataCountDownload = getCountArray(dataMonth, data2)

                props.setActivity({ Month: dataMonth, Upload: dataCountUpload, Download: dataCountDownload })
              })
          })
      })
  }

  const convertMonth = (month) => {
    switch (month) {
      case 1:
        return "January"
      case 2:
        return "February"
      case 3:
        return "March"
      case 4:
        return "April"
      case 5:
        return "May"
      case 6:
        return "June"
      case 7:
        return "July"
      case 8:
        return "August"
      case 9:
        return "September"
      case 10:
        return "October"
      case 11:
        return "November"
      case 12:
        return "December"
    }
  }

  const getMonthArray = (array1, array2) => {
    let allMonth = []

    if (array1.length == 0 && array2.length == 0) {
      return allMonth
    }

    array1.forEach(e => {
      if (!allMonth.includes(e.Month)) {
        allMonth.push(e.Month)
      }
    })
    array2.forEach(e => {
      if (!allMonth.includes(e.Month)) {
        allMonth.push(e.Month)
      }
    })
    allMonth = allMonth.sort(function (a, b) {
      return a - b;
    })
    for (let i = 0; i < allMonth.length; i++) {
      allMonth[i] = convertMonth(allMonth[i])
    }

    return allMonth
  }

  const getCountArray = (array1, array2) => {
    let arr = []

    if (array1.length == 0 || array2.length == 0) {
      return arr
    }

    for (let i = 0; i < array1.length; i++) {
      let found = false
      for (let j = 0; j < array2.length; j++) {
        if (array1[i] == convertMonth(array2[j].Month)) {
          arr.push(array2[j].Count)
          found = true
          break
        }
      }
      if (!found) {
        arr.push(0)
      }
    }

    return arr
  }

  return (
    <div className="shadowHover pb-5-responsive shadow bg-white rounded">
      <p className="text-primary">
        Activities in
        <select
          className="ml-2"
          onChange={handleSelect}
        >
          {props.firstYear.map((item, key) => (
            <option
              key={key}
              value={item}
            >
              {item}
            </option>
          ))}
        </select>
      </p>

      <hr />

      <div id="graphBtn">
        <Button variant="primary" id="barGraph" onClick={() => setGraphType(0)}>
          <BarChartLine
            size={16}
          />
        </Button>

        <Button variant="primary" className="ml-1" id="lineGraph" onClick={() => setGraphType(1)}>
          <GraphUp
            size={16}
          />
        </Button>
      </div>

      {graphType == 0 ? <BarGraph data={data} /> : <LineGraph data={data} />}

      <hr />

      <p className="text-right text-primary">
        <a
          href="/Admin/ActivityReport"
        >
          Open Activity Report
          <ChevronRight
            size={16}
            className="ml-2"
          />
        </a>
      </p>
    </div>
  )
}

ActivityChart.propTypes = {
  firstYear: PropTypes.arrayOf(PropTypes.number),
  activity: PropTypes.object,
  setActivity: PropTypes.func,
  planningArea: PropTypes.string,
}

export default ActivityChart
