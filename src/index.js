import './styles.css';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import $ from 'jquery';
import moment from 'moment';
import alertify from '../alertifyjs/alertify';
import '../alertifyjs/css/alertify.css';
import '../alertifyjs/css/themes/default.css';

const dayGIF = 'https://mondrian.mashable.com/wp-content%252Fuploads%252F2013%252F04%252Fpalm-trees.gif%252Ffull-fit-in__1200x2000.gif?signature=u6Pkj2nxfqX8m9jTaqwq1Xl6iqM=&source=http%3A%2F%2Fmashable.com';
const nightGIF = 'https://i.gifer.com/VTNI.gif';

const getCity = async () => {
  const cityInput = $('.city-name');
  const cityName = cityInput.val();
  cityInput.val('');

  const celOrFahrNode = document.querySelector('.cel-or-fahr');
  const celOrFahr = celOrFahrNode.textContent;
  let API = '';

  if (celOrFahr === 'celsius') {
    API = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=934ea5f8bc3f198fabf59b607a2fcc71`;
  } else {
    API = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=imperial&appid=934ea5f8bc3f198fabf59b607a2fcc71`;
  }

  let response = '';
  let city = '';

  try {
    response = await fetch(API);

    if (response.ok === false) {
      throw Error('The city provided does not exist, the default city will be used.');
    }

    city = await response.json();
  } catch (error) {
    API = 'https://api.openweathermap.org/data/2.5/weather?q=tokyo&units=metric&appid=934ea5f8bc3f198fabf59b607a2fcc71';
    response = await fetch(API);
    city = await response.json();
    alertify.alert(`${error}`);
  }

  return city;
};

const displayDetails = (city) => {
  const cityName = $('.content-city-name');
  const cityTemperature = $('.content-city-temperature');
  const cityTime = $('.content-city-time');
  const celOrFahr = $('.cel-or-fahr').text();
  const cityTemperatureType = $('.content-city-temperature-type');

  const { dt } = city;
  const cityTimezone = city.timezone;

  const currentTime = moment.unix(dt).utc().add(cityTimezone, 's');
  const currentTimeReadable = currentTime.format('LTS');

  cityName.empty();
  cityTemperature.empty();
  cityTime.empty();
  cityTemperatureType.empty();

  cityName.append(city.name, ', ', city.sys.country);
  cityTemperature.append(Math.round(city.main.temp));

  if (celOrFahr === 'celsius') {
    cityTemperatureType.append('C');
  } else {
    cityTemperatureType.append('F');
  }

  cityTime.append(currentTimeReadable);

  /* eslint-disable no-underscore-dangle */

  return currentTime._i;

  /* eslint-enable no-underscore-dangle */
};

const dayOrNight = (city, unixTime) => {
  const day = city.sys.sunrise;
  const night = city.sys.sunset;
  unixTime = unixTime.toString().slice(0, -3);
  unixTime = Number(unixTime);

  if (unixTime >= day && unixTime < night) {
    return 'day';
  }
  return 'night';
};

$(() => {
  $('#chkSwitch').change(function toggleTemps() {
    const currentTempNode = document.querySelector('.content-city-temperature');
    let currentTemp = currentTempNode.textContent;
    const celOrFahrNode = document.querySelector('.cel-or-fahr');
    const cityTemperatureType = $('.content-city-temperature-type');

    if ($(this).prop('checked') === true) {
      currentTemp = (currentTemp * (9 / 5)) + 32;
      currentTemp = parseFloat(currentTemp).toFixed(1);
      currentTemp = Math.round(currentTemp);
      currentTempNode.textContent = currentTemp;
      celOrFahrNode.textContent = 'fahrenheit';

      cityTemperatureType.empty();
      cityTemperatureType.text('F');
    } else {
      currentTemp = (currentTemp - 32) * (5 / 9);
      currentTemp = parseFloat(currentTemp).toFixed(1);
      currentTemp = Math.round(currentTemp);
      currentTempNode.textContent = currentTemp;
      celOrFahrNode.textContent = 'celsius';

      cityTemperatureType.empty();
      cityTemperatureType.text('C');
    }
  });
});

const initApp = async () => {
  const city = await getCity();
  const unixTime = await displayDetails(city);
  const dayNight = await dayOrNight(city, unixTime);

  if (dayNight === 'night') {
    $('.main-title').css('color', 'white');
    $('.row h1').css('color', 'white');
    $('.bg').css('background-image', `url(${nightGIF})`);
  } else {
    $('.main-title').css('color', 'white');
    $('.row h1').css('color', 'black');

    $('.bg').css('background-image', `url(${dayGIF})`);
  }
  $('.switch.ios').css('display', 'block');
};

$('#query-city').submit((e) => {
  e.preventDefault();
  initApp();
});

window.initApp = initApp;
