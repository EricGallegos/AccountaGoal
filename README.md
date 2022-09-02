# AccountaGoal
Motivating Task Manager - [Check it out](https://accountagoal.herokuapp.com/)

![AccountaGoalLogo](https://user-images.githubusercontent.com/46502883/185517168-3c9b4e6e-1fa0-49ca-ae15-2a413cdc3370.png)

## What is AccountaGoal?
Keep track of the goals you set for yourself and as a bonus build a historical heatmap of
your accomplishments!

Inspired by Github's contribution chart, this website lets anyone engage
in the satisfying act of filling a chart with data.

Even better that data will be everything you have been getting done!

## Built with
- Node.js
- Materialize
- Handlebars
- MongoDB
- Google Auth 2.0
- HTML
- CSS

## Learning focus
- MVC architecture
- Materialize framework
- Responsive design

## Features in Development
- Dark theme
- ~~Ability to add goals that reoccur by day of week (Sun, Mon, ...)~~ Just Added
- History chart will have data hidden within showing total goals completed on that day that can be viewed on mouse hover.

## Contribution
Contributions are welcome! Fork, clone, report issues, make pull requests.

## Featured Code
This is the Schema for the goals that users can populate the database with.
Note the ref option on the user property set to the User schema. This allows informational access to the User object from the Goal object to occur so that when it comes time to render html, Handlebars can read information from both the Goals objects and the Users objects they reference.

```javascript
const GoalSchema = new mongoose.Schema({
  body: {
    type: String,
    required: true,
    trim: true,
  },
  repeating:{
    type: String,
    default: 'false',
  },
  status: {
    type: String,
    default: 'incomplete',
    enum: ['incomplete', 'complete'],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  dueDate: {
    type: Date,
    set: d => moment(d).endOf('day'),
  },
  startDate: {
    type: Date,
  },
  completedOn: {
    type: Date,
    default: null,
  },
  archived:{
    type: Boolean,
    default: false,
  },
  creatorID:{
    type: mongoose.Schema.Types.ObjectId,
  }
})
```
