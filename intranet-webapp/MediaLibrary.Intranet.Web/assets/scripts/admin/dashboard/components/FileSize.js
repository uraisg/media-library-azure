import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { ChevronRight } from 'react-bootstrap-icons'

ChartJS.register(ArcElement, Tooltip, Legend);

const options = {
  plugins: {
    legend: {
      display: false
    }
  }
}

const FileSize = (props) => {
  const data = {
    labels: props.fileSize.Key,
    datasets: [
      {
        label: 'File Size Groupings',
        data: props.fileSize.Count,
        backgroundColor: [
          '#86BBD8',
          '#33658A',
          '#F6AE2D'
        ],
        hoverOffset: 4,
      },
    ],
  };

  const handleSelect = (e) => {
    fetch(`/api/filedetails/filesize/${props.planningArea}/${e.target.value}`, {
      mode: 'same-origin',
      credentials: 'same-origin',
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status}`)
        }
        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          throw new TypeError("Oops, we haven't got JSON!")
        }
        return response.json()
      })
      .then((data) => {
        let key = []
        let count = []

        data.forEach(fileSize => {
          key.push(fileSize.FileSize + "mb-" + (parseInt(fileSize.FileSize) + 1).toString() + "mb")
          count.push(fileSize.Count)
        })

        props.setFileSize({ Key: key, Count: count, Selected: e.target.value })
      })
  }

  return (
    <div className="shadowHover pb-5-responsive shadow bg-white rounded">
      <p className="text-primary">
        File Sizes in
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

      <Pie options={options} data={data} height={150} />

      <hr className="mt-3" />

      <p className="text-right text-primary">
        <a
          href="/Admin/FileReport"
        >
          Open File Report
          <ChevronRight
            size={16}
            className="ml-2"
          />
        </a>
      </p>
    </div >
  )
}

export default FileSize
