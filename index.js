const plotter = require('xy-plotter');
const mg      = require('maze-generator');

const
  cols = Math.floor(plotter.width / 4),
  rows = Math.floor(plotter.height / 4),
  margin = 20,
  scale = (plotter.width - margin * 2) / cols,
  maze = new mg.Maze(cols, rows, Math.floor(Math.random() * cols), 0).generate(),
  solver = new mg.Solver(maze).solve(),
  job = plotter.Job('maze');

let x = 0, y = 0, visitedCells = 0;

job.move(margin, margin).pen(20);
// job.setSpeed(.8);

maze.start.walls[0] = false;
maze.end.walls[2] = false;

while (visitedCells < maze.cells.length) {
  let index = x + y * maze.cols;
  let cell = maze.cells[index];

  if (cell) {
    if (cell.walls[3]) {
      cell.walls[3] = false;
      if(y < maze.rows) y++;
      job.move(margin + x * scale, margin + y * scale);

    } else if (cell.walls[0]) {
      cell.walls[0] = false;
      if(x < maze.cols) x++;
      job.move(margin + x * scale, margin + y * scale);

    } else {
      maze.cells[index] = null;
      visitedCells++;
    }
  } else {
    let result = null;;
    for (let i = 0; i < maze.cells.length; i++) {
      let next = maze.cells[i];
      if (next) {
        if (next.walls[0] || next.walls[3]) {
          result = next;
          x = next.x;
          y = next.y;
          job.pen(0);
          job.move(margin + x * scale, margin + y * scale);
          job.pen(20);
          break;
        }
      }
    }
    if (result === null) break;
  }
}

job
  .pen(0)
  .move(margin + 0, margin + maze.rows * scale)
  .pen(20)
  .move(margin + maze.end.x * scale, margin + maze.rows * scale)
  .pen(0)
  .move(margin + (maze.end.x + 1) * scale, margin + maze.rows * scale)
  .pen(20)
  .move(margin + maze.cols * scale, margin + maze.rows * scale)
  .move(margin + maze.cols * scale, margin + 0);

job.pen(0).home();

path = require('path');
const file = plotter.File();
file.export(job, path.join(__dirname, 'maze.png'));

const stat = plotter.Stats(job);
console.log(`ETA between ${stat.getDuration().min.formatted} and ${stat.getDuration().max.formatted}`);

plotter.Serial('/dev/tty.wchusbserial1410').send(job);