var path = require('path')
var webpack = require('webpack')
var glob = require('glob')
var entryList = glob.sync("./src/**/*.js", {
	cwd:'./',
	nobrace:true
});
var entryObj = {};
entryList.forEach((one)=>{
	entryObj[one.replace(/.\/src\/|.js$/g, '')] = '' + one;
});
module.exports = {
  entry: entryObj,
  output: {
    path: __dirname + '/build',
    filename: '[name].js',
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, '../../src')
    }
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader:  'buble',
        exclude: /node_modules|vue\/dist|vuex\/dist/,
      },
      {
        test: /\.vue$/,
        loader: 'vue'
      },
      {
        test: /\.(png|woff2)$/,
        loader: 'url?limit=0'
      }
    ]
  },
  vue: {
    loaders: {
      js: 'buble'
    }
  },
  devtool: process.env.NODE_ENV !== 'production'
    ? '#inline-source-map'
    : false
}

if (process.env.NODE_ENV === 'production') {
  module.exports.plugins = [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  ]
}
