const plotter = require('xy-plotter');
const mg      = require('maze-generator');


const
  cols = Math.floor(plotter.width / 4),
  rows = Math.floor(plotter.height / 4),
  margin = 10,
  scale = (plotter.width - margin * 2) / cols,
  maze = new mg.Maze(cols, rows, Math.floor(Math.random() * cols), 0).generate(),
  solver = new mg.Solver(maze).solve(),
  job = plotter.Job('maze');

let walls = {
  vertical: [],
  horizontal: [],
};

for (let col = 0; col < cols; col++) {
  let verticalWalls = (col === cols - 1) ? [[], []] : [];
  for (let row = 0; row < rows; row++) {
    let index = col + row * cols;
    let cell = maze.cells[index];
    for (let j = 0; j < cell.walls.length; j++) {
      let wall = cell.walls[j];
      if (col === cols - 1) {
        if (j === 3) verticalWalls[0].push(wall);
        if (j === 1) verticalWalls[1].push(wall);
      } else {
        if (j === 3) verticalWalls.push(wall);
      }
    }
  }
  if (col === cols - 1) {
    walls.vertical.push(verticalWalls[0]);
    walls.vertical.push(verticalWalls[1]);
  } else {
    walls.vertical.push(verticalWalls);
  }
}

for (let row = 0; row < rows; row++) {
  let horizontalWalls = (row === rows - 1) ? [[], []] : [];
  for (let col = 0; col < cols; col++) {
    let index = col + row * cols;
    let cell = maze.cells[index];
    for (let j = 0; j < cell.walls.length; j++) {
      let wall = cell.walls[j];
      if (row === rows - 1) {
        if (j === 0) horizontalWalls[0].push(wall);
        if (j === 2) horizontalWalls[1].push(wall);
      } else {
        if (j === 0) horizontalWalls.push(wall);
      }
    }
  }
  if (row === rows - 1) {
    walls.horizontal.push(horizontalWalls[0]);
    walls.horizontal.push(horizontalWalls[1]);
  } else {
    walls.horizontal.push(horizontalWalls);
  }
}

// open start and end
walls.horizontal[maze.start.y][maze.start.x] = false;
walls.horizontal[maze.end.y + 1][maze.end.x] = false;

// mark start and end
job.circle(margin + maze.start.x * scale + scale / 2, margin + maze.start.y * scale, scale * 0.25, 7);
job.circle(margin + maze.end.x * scale + scale / 2, margin + maze.end.y * scale + scale, scale * 0.25, 7);


job.setSpeed(0.8);
for (let col = 0; col < walls.vertical.length; col++) {
  let segments = walls.vertical[col];
  job.pen_up();
  for (let i = 0; i < segments.length; i++) {
    let segment = segments[i];
    job.move(margin + col * scale, margin + i * scale);
    if (segment) job.pen_down();
    else job.pen_up();
  }
  job.move(margin + col * scale, margin + segments.length * scale);
}

for (let row = 0; row < walls.horizontal.length; row++) {
  let segments = walls.horizontal[row];
  job.pen_up();
  for (let i = 0; i < segments.length; i++) {
    let segment = segments[i];
    job.move(margin + i * scale, margin + row * scale);
    if (segment) job.pen_down();
    else job.pen_up();
  }
  job.move(margin + segments.length * scale, margin + row * scale);
}

const path = require('path');
const file = plotter.File();
file.write(job, path.join(__dirname, 'maze.png'));

// plotter.Serial('/dev/tty.wchusbserial1410').send(job);