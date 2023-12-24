// Bakeoff #2 -- Seleção em Interfaces Densas
// IPM 2022-23, Período 3
// Entrega: até dia 31 de Março às 23h59 através do Fenix
// Bake-off: durante os laboratórios da semana de 10 de Abril

// p5.js reference: https://p5js.org/reference/

// Database (CHANGE THESE!)
const GROUP_NUMBER = 39; // Add your group number here as an integer (e.g., 2, 3)
const RECORD_TO_FIREBASE = false; // Set to 'true' to record user results to Firebase

// Pixel density and setup variables (DO NOT CHANGE!)
let PPI, PPCM;
const NUM_OF_TRIALS = 12; // The numbers of trials (i.e., target selections) to be completed
const GRID_ROWS = 8; // We divide our 80 targets in a 8x10 grid
const GRID_COLUMNS = 10; // We divide our 80 targets in a 8x10 grid
let continue_button;
let legendas; // The item list from the "legendas" CSV

// Metrics
let testStartTime, testEndTime; // time between the start and end of one attempt (8 trials)
let hits = 0; // number of successful selections
let misses = 0; // number of missed selections (used to calculate accuracy)
let database; // Firebase DB

// Study control parameters
let draw_targets = false; // used to control what to show in draw()
let trials; // contains the order of targets that activate in the test
let current_trial = 0; // the current trial number (indexes into trials array above)
let attempt = 0; // users complete each test twice to account for practice (attemps 0 and 1)

// Target list
let targets = [];

// VARIÁVEIS ADICIONADAS:

// Espaçamento entre grupos
const row_space = 650;

let frutas_sort = [];
let sumos_sort = [];
let leites_sort = [];
let vegetais_sort = [];

let target_labels = [];

function ordena_array(array1, array2) {
  if (array1[0] < array2[0]) return -1;

  return 1;
}

function ordena_grupos() {
  for (let i = 0; i <= 27; i++) {
    frutas_sort[i] = new Array(2);

    frutas_sort[i][0] = legendas.getString(i, 0);
    frutas_sort[i][1] = legendas.getNum(i, 1);
  }
  frutas_sort.sort(ordena_array);
  for (let i = 0; i <= 27; i++) target_labels.push(frutas_sort[i]);

  for (let i = 0; i <= 8; i++) {
    sumos_sort[i] = new Array(2);

    sumos_sort[i][0] = legendas.getString(i + 28, 0);
    sumos_sort[i][1] = legendas.getNum(i + 28, 1);
  }
  sumos_sort.sort(ordena_array);
  for (let i = 0; i <= 8; i++) target_labels.push(sumos_sort[i]);

  for (let i = 0; i <= 20; i++) {
    leites_sort[i] = new Array(2);

    leites_sort[i][0] = legendas.getString(i + 37, 0);
    leites_sort[i][1] = legendas.getNum(i + 37, 1);
  }
  leites_sort.sort(ordena_array);
  for (let i = 0; i <= 20; i++) target_labels.push(leites_sort[i]);

  for (let i = 0; i <= 21; i++) {
    vegetais_sort[i] = new Array(2);

    vegetais_sort[i][0] = legendas.getString(i + 58, 0);
    vegetais_sort[i][1] = legendas.getNum(i + 58, 1);
  }
  vegetais_sort.sort(ordena_array);
  for (let i = 0; i <= 21; i++) target_labels.push(vegetais_sort[i]);
}

// Ensures important data is loaded before the program starts
function preload() {
  legendas = loadTable("legendas.csv", "csv", "header");
}

// Runs once at the start
function setup() {
  createCanvas(700, 500); // window size in px before we go into fullScreen()
  frameRate(60); // frame rate (DO NOT CHANGE!)

  ordena_grupos();

  cursor(CROSS);

  randomizeTrials(); // randomize the trial order at the start of execution
  drawUserIDScreen(); // draws the user start-up screen (student ID and display size)
}

// Runs every frame and redraws the screen
function draw() {
  if (draw_targets && attempt < 2) {
    // The user is interacting with the 6x3 target grid
    background(color(0, 0, 0)); // sets background to black

    // Print trial count at the top left-corner of the canvas
    textFont("Arial", 16);
    fill(color(255, 255, 255));
    textAlign(LEFT);
    text("Trial " + (current_trial + 1) + " of " + trials.length, 50, 20);

    // Draw all targets
    for (var i = 0; i < legendas.getRowCount(); i++) targets[i].draw();

    // Group labels
    /*draw_label("Frutas", 80, 55);
    draw_label("Sumos", 717, 135);
    draw_label("Vegetais", 165, 445);
    draw_label("Leites", 717, 445); */

    // Draw the target label to be selected in the current trial
    textFont("Arial", 20);
    textAlign(CENTER);
    text(legendas.getString(trials[current_trial], 0), width / 2, height - 20);
  }
}

// Print and save results at the end of 54 trials
function printAndSavePerformance() {
  // DO NOT CHANGE THESE!
  let accuracy = parseFloat(hits * 100) / parseFloat(hits + misses);
  let test_time = (testEndTime - testStartTime) / 1000;
  let time_per_target = nf(test_time / parseFloat(hits + misses), 0, 3);
  let penalty = constrain(
    (parseFloat(95) - parseFloat(hits * 100) / parseFloat(hits + misses)) * 0.2,
    0,
    100
  );
  let target_w_penalty = nf(
    test_time / parseFloat(hits + misses) + penalty,
    0,
    3
  );
  let timestamp =
    day() +
    "/" +
    month() +
    "/" +
    year() +
    "  " +
    hour() +
    ":" +
    minute() +
    ":" +
    second();

  textFont("Arial", 18);
  background(color(0, 0, 0)); // clears screen
  fill(color(255, 255, 255)); // set text fill color to white
  textAlign(LEFT);
  text(timestamp, 10, 20); // display time on screen (top-left corner)

  textAlign(CENTER);
  text("Attempt " + (attempt + 1) + " out of 2 completed!", width / 2, 60);
  text("Hits: " + hits, width / 2, 100);
  text("Misses: " + misses, width / 2, 120);
  text("Accuracy: " + accuracy + "%", width / 2, 140);
  text("Total time taken: " + test_time + "s", width / 2, 160);
  text("Average time per target: " + time_per_target + "s", width / 2, 180);
  text(
    "Average time for each target (+ penalty): " + target_w_penalty + "s",
    width / 2,
    220
  );

  // Saves results (DO NOT CHANGE!)
  let attempt_data = {
    project_from: GROUP_NUMBER,
    assessed_by: student_ID,
    test_completed_by: timestamp,
    attempt: attempt,
    hits: hits,
    misses: misses,
    accuracy: accuracy,
    attempt_duration: test_time,
    time_per_target: time_per_target,
    target_w_penalty: target_w_penalty,
  };

  // Send data to DB (DO NOT CHANGE!)
  if (RECORD_TO_FIREBASE) {
    // Access the Firebase DB
    if (attempt === 0) {
      firebase.initializeApp(firebaseConfig);
      database = firebase.database();
    }

    // Add user performance results
    let db_ref = database.ref("G" + GROUP_NUMBER);
    db_ref.push(attempt_data);
  }
}

// Mouse button was pressed - lets test to see if hit was in the correct target
function mousePressed() {
  // Only look for mouse releases during the actual test
  // (i.e., during target selections)
  if (draw_targets) {
    for (var i = 0; i < legendas.getRowCount(); i++) {
      // Check if the user clicked over one of the targets
      if (targets[i].clicked(mouseX, mouseY)) {
        // Checks if it was the correct target
        if (targets[i].id === trials[current_trial]) hits++;
        else misses++;

        current_trial++; // Move on to the next trial/target
        break;
      }
    }

    // Check if the user has completed all trials
    if (current_trial === NUM_OF_TRIALS) {
      testEndTime = millis();
      draw_targets = false; // Stop showing targets and the user performance results
      printAndSavePerformance(); // Print the user's results on-screen and send these to the DB
      attempt++;

      // If there's an attempt to go create a button to start this
      if (attempt < 2) {
        continue_button = createButton("START 2ND ATTEMPT");
        continue_button.mouseReleased(continueTest);
        continue_button.position(
          width / 2 - continue_button.size().width / 2,
          height / 2 - continue_button.size().height / 2
        );
      }
    }
    // Check if this was the first selection in an attempt
    else if (current_trial === 1) testStartTime = millis();
  }
}

// Evoked after the user starts its second (and last) attempt
function continueTest() {
  // Re-randomize the trial order
  randomizeTrials();

  // Resets performance variables
  hits = 0;
  misses = 0;

  current_trial = 0;
  continue_button.remove();

  // Shows the targets again
  draw_targets = true;
}

// Creates and positions the UI targets
function createTargets(target_size, horizontal_gap, vertical_gap) {
  // Define the margins between targets by dividing the white space
  // for the number of targets minus one

  // Extra - row space retira o espaço entre grupos
  h_margin = (horizontal_gap - row_space) / (GRID_COLUMNS - 1);
  v_margin = vertical_gap / (GRID_ROWS - 1);

  let x_increment = 0;
  let current_row = 0.2;
  let juices_x = 0;
  let lactose_x = 0;

  draw_label("Frutas", 40, 55);

  // Set targets in a 8 x 10 grid
  for (var r = 0; r < GRID_ROWS; r++) {
    for (var c = 0; c < GRID_COLUMNS; c++) {
      if (c == 8 && r == 2) {
        // start of juices group
        x_increment += 0.4;
        juices_x = x_increment;
        current_row = 1.073;
      } else if (c == 7 && r == 3) {
        // start of lactose group
        lactose_x = juices_x;
        x_increment = lactose_x;
        current_row += 1.3;
      } else if (c == 8 && r == 5) {
        // start of vegetable group
        x_increment = 1.07;
        current_row -= 1.75;
      }

      let target_x =
        40 + (h_margin + target_size) * x_increment + target_size / 2; // give it some margin from the left border
      let target_y = (v_margin + target_size) * current_row + target_size / 2;

      x_increment += 1.08;

      // Draws the groups
      if ((c == 6 && r == 0) || (c == 3 && r == 1) || (c == 0 && r == 2)) {
        // fruit group
        x_increment = 0;
        current_row += 0.88;
      } else if ((c == 0 && r == 3) || (c == 3 && r == 3)) {
        // juice group
        x_increment = juices_x;
        current_row += 0.88;
      } else if ((c == 3 && r == 4) || (c == 0 && r == 5)) {
        // lactose group
        x_increment = lactose_x;
        current_row += 0.88;
      } else if ((c == 3 && r == 6) || (c == 9 && r == 6)) {
        // vegetable group
        x_increment = 1.07;
        current_row += 0.88;
      } else if (c == 5 && r == 7) {
        // last row of vegetables
        x_increment = 2;
        current_row += 0.88;
      }

      // Find the appropriate label and ID for this target
      let legendas_index = c + GRID_COLUMNS * r;
      let target_label = legendas.getString(legendas_index, 0);
      let target_id = legendas.getNum(legendas_index, 1);

      let target = new Target(
        target_x,
        target_y + 40,
        target_size,
        target_labels[GRID_COLUMNS * r + c][0],
        target_labels[GRID_COLUMNS * r + c][1]
      );
      targets.push(target);
    }
  }
}

// Is invoked when the canvas is resized (e.g., when we go fullscreen)
function windowResized() {
  if (fullscreen()) {
    // DO NOT CHANGE THESE!
    resizeCanvas(windowWidth, windowHeight);
    let display = new Display({ diagonal: display_size }, window.screen);
    PPI = display.ppi; // calculates pixels per inch
    PPCM = PPI / 2.54; // calculates pixels per cm

    // Make your decisions in 'cm', so that targets have the same size for all participants
    // Below we find out out white space we can have between 2 cm targets
    let screen_width = display.width * 2.54; // screen width
    let screen_height = display.height * 2.54; // screen height
    let target_size = 2; // sets the target size (will be converted to cm when passed to createTargets)
    let horizontal_gap = screen_width - target_size * GRID_COLUMNS; // empty space in cm across the x-axis (based on 10 targets per row)
    let vertical_gap = screen_height - target_size * GRID_ROWS; // empty space in cm across the y-axis (based on 8 targets per column)

    // Creates and positions the UI targets according to the white space defined above (in cm!)
    // 80 represent some margins around the display (e.g., for text)
    createTargets(
      target_size * PPCM,
      horizontal_gap * PPCM - 80,
      vertical_gap * PPCM - 80
    );

    // Starts drawing targets immediately after we go fullscreen
    draw_targets = true;
  }
}

// FUNÇÕES ADICIONAIS
function draw_label(label, x, y) {
  textFont("Arial", 12);
  fill(color(255, 255, 255));
  textAlign(CENTER);
  textStyle(BOLD);
  text(label, x, y);
  textStyle(NORMAL);
}
