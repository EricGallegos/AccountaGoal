const moment = require('moment');

module.exports = {
  formatDate: function(date, format){
    return moment(date).format(format);
  },
  truncate: function (str, len){
    if( str.length > len && str.length > 0){
      let newStr = str + ' ';
      newStr = str.substr(0, len);
      newStr = str.substr(0, newStr.lastIndexOf(' '));
      newStr = newStr.length > 0 ? newStr : str.substr(0, len);
      return newStr;
    }
    return str;
  },
  stripTags: function(input){
    if(!input) return;
    return input.replace(/<(?:.|\n)*?>/gm, '');
  },
  editIcon: function(contentUser, loggedUser, contentId, floating = true){
    if(contentUser._id.toString() == loggedUser._id.toString()){
      if(floating){
        return `<a href="/content/edit/${contentId}" class="btn-floating halfway-fab blue">
                <i class="fas fa-edit fa-small"></i></a>`;
      } else{
        return `<a href="/content/edit/${contentId}><i class="fas fa-edit"></i></a>`;
      }
    }else{
      return '';
    }
  },
  select: function(selected, options){
    return options
    .fn(this)
    .replace(
      new RegExp(' value="' + selected + '"'),
      '$& selected="selected"',
    )
    .replace(
      new RegExp('>' + selected + '</options>'),
      ' selected="selected"$&'
    )
  },
  checkStatus: function(status){
    if(status == "incomplete") return false;
    if(status == "complete") return true;
  },
  getToday: function(timeZone){
    let format = 'YYYY-MM-DD'
    let today = new Date();
    return moment(today).format(format)
  },
  getNumWord: function(num){
    switch (num) {
      case 0:
        return 'one';
        break;
      case 1:
        return 'two';
        break;
      case 2:
        return 'three';
        break;
      case 3:
        return 'four';
        break;
      case 4:
        return 'five';
        break;
      case 5:
        return 'six';
        break;
      case 6:
        return 'seven';
        break;
      case 7:
        return 'eight';
        break;
      case 8:
        return 'nine';
        break;
      case 9:
        return 'ten';
        break;
      default:
        return 'zero';
    }
  }
}
