'use strict';
//Lava Lamp SVG element
//Copyright Andrew Blackledge 2018 
//via https://github.com/Procedurally-Unorthodox/LavaLamp

var marching_hash = [[],[[0,.5,.5,1]],[[.5,1,1,.5]],[[0,.5,1,.5]],
	[[1,.5,.5,0]],[[0,.5,.5,0],[1,.5,.5,1]],[[.5,1,.5,0]],[[0,.5,.5,0]],
	[[.5,0,0,.5]],[[.5,0,.5,1]],[[.5,0,1,.5],[.5,1,0,.5]],[[.5,0,1,.5]],
	[[1,.5,0,.5]],[[1,.5,.5,1]],[[.5,1,0,.5]],[]];

//takes in a set of 2-dimensional points (ignores extra dimensions)
//generates a set of marching squares segments
//links segments into border
//returns simplified border
function generate_marching_border(grid, threshold){
	
  width = grid.x - 1;
  height = grid.y - 1

	var segments = [];
	var segment,score;
	for(var xx=0;xx<width;xx++){
		for(var yy=0;yy<height;yy++){
      var ref = grid.getSegment(xx,yy);
      ref.length = 0
			score = 0;
      grid.getValue(xx,yy)
			if(grid.getValue(xx,yy)>threshold){score+=8;}
			if(grid.getValue(xx+1,yy)>threshold){score+=4;}
			if(grid.getValue(xx+1,yy+1)>threshold){score+=2;}
			if(grid.getValue(xx,yy+1)>threshold){score+=1;}
			for(var hl=0;hl<marching_hash[score].length;hl++){
				segment = marching_hash[score][hl].slice(0)
				segment[0]+=xx;
				segment[1]+=yy;
				segment[2]+=xx;
				segment[3]+=yy;
				ref.push(segment);
			}
			if(score%15!=0){
				segments.push([xx,yy]);
			}
		}
	}
	var paths = [];
	var x,y,unfound,path;
	while(segments.length>0){
		var current = segments.pop();
		x = current[0];
		y = current[1];
    var ref = grid.getSegment(x,y)
		if(ref.length==0){continue;}
		if(ref.length==2){
			segments.push(current);
		}
		path = [ref.pop()];
		current = path[0];
		while(true){
			unfound = true;
			if(current[2]==x){
        var left_ref = grid.getSegment(x - 1, y);
				for(var ii=0;ii<left_ref.length;ii++){
					if(left_ref[ii][0]==current[2]&&left_ref[ii][1]==current[3]){
						unfound = false;
						current = left_ref.splice(ii,1)[0];
						path.push(current);
						x-=1;
						break;
					}
				}
			}else if(current[2]==x+1){
        var right_ref = grid.getSegment(x + 1, y);
				for(var ii=0;ii<right_ref.length;ii++){
					if(right_ref[ii][0]==current[2]&&right_ref[ii][1]==current[3]){
						unfound = false;
						current = right_ref.splice(ii,1)[0];
						path.push(current);
						x+=1;
						break;
					}
				}
			}else if(current[3]==y){
        var down_ref = grid.getSegment(x, y - 1);
				for(var ii=0;ii<down_ref.length;ii++){
					if(down_ref[ii][0]==current[2]&&down_ref[ii][1]==current[3]){
						unfound = false;
						current = down_ref.splice(ii,1)[0];
						path.push(current);
						y-=1;
						break;
					}
				}
			}else if(current[3]==y+1){
        var up_ref = grid.getSegment(x, y + 1);
				for(var ii=0;ii<up_ref.length;ii++){
					if(up_ref[ii][0]==current[2]&&up_ref[ii][1]==current[3]){
						unfound = false;
						current = up_ref.splice(ii,1)[0];
						path.push(current);
						y+=1;
						break;
					}
				}
			}
			if(unfound){
				break;
			}
		}
		paths.push(path);
	}
	return paths;
}

function paths2string (paths, scale_x, scale_y) {
  var svgpath = "", i, j;
  if (!scale_x) scale_x = 1;
	if (!scale_y) scale_y = 1;
  for(i = 0; i < paths.length; i++) {
    for(j = 0; j < paths[i].length; j++){
      if (!j) svgpath += "M";
      else svgpath += "L";
      svgpath += ((paths[i][j][0] - 0) / scale_x) + ", " + ((paths[i][j][1] - 0) / scale_y);
    }
    svgpath += "Z";
  }
  if (svgpath=="") svgpath = "M0,0";
  return svgpath;
}

function clamp(current,min,max){
	return Math.min(Math.max(current,min),max);
}

const effect_state = {
	STOPPED : 0,
	RUNNING : 1,
	DOOMED : 2
}

class grid{
  constructor(x,y){
    this.x = x;
    this.y = y;

    this.values = [];
    this.segments = [];


    this.max_size = x*y;

    for(var ii=0;ii<x*y;ii++){
      this.values.push(-1)
      this.segments.push([])
    }
  }
  resize(x,y){
    this.x = x;
    this.y = y;
    if(x*y>this.max_size){
      for(var ii=this.max_size;ii<x*y;ii++){
        this.values.push(-1)
        this.segments.push([])
      }
      this.max_size = x*y
    }else{
      for(var ii=x*y;ii<this.max_size;ii++){
        this.values[ii] = 0
        this.segments[ii].length = 0
      }
    }

    for(var ii=0;ii<x;ii++){
      this.values[ii] = 0;
      this.values[ii+x*(y-1)] = 0;
    }

    for(var ii=0;ii<y;ii++){
      this.values[x*ii] = 0;
      this.values[x*ii+x-1] = 0;
    }

  }
  getValue(x,y){
    if(x!=clamp(x,0,this.x) || y!=clamp(y,0,this.y)){
      return
    }
    return this.values[x+this.x*y];
  }
  getSegment(x,y){
    if(x!=clamp(x,0,this.x) || y!=clamp(y,0,this.y)){
      return
    }
    return this.segments[x+this.x*y];
  }
  setValue(x,y,value){
    if(x!=clamp(x,0,this.x) || y!=clamp(y,0,this.y)){
      return
    }
    this.values[x+this.x*y] = value;
  }
}

class effect{
	constructor(simplex, target, density_x, density_y){
		this.simplex = simplex;
		this.target = target;

    this.svg_x = Math.floor(target.width()*density_x)/density_x;
		this.svg_y = Math.floor(target.height()*density_y)/density_y;

    this.display_x = density_x;
		this.display_y = density_y;

    this.grid = new grid(this.svg_x * this.display_x+1,
      this.svg_y * this.display_y+1)

		this.noise_x = 60;
		this.noise_y = 60;

		this.colors = [20,30,10,80,60,50,30,20]

		this.position_x = 0;
		this.position_y = 0;
		this.velocity_x = 0;
		this.velocity_y = 0

		this.state = effect_state.STOPPED;

		this.elapsed_time = 0
	}
	start(){
		this.state = effect_state.RUNNING;
		this.iterate();
	}
	iterate(){
		if(this.state == effect_state.DOOMED){
			this.target[0].innerHTML = '<div></div>';
			return;
		}
		this.resize()

		var svg = '<svg width="'+this.svg_x+'" height="'+this.svg_y+'" id="board">';

		this.velocity_x += Math.random()/20-.025;
		this.velocity_y += Math.random()/20-.025;

		this.velocity_x = clamp(this.velocity_x,-.8,.8)
		this.velocity_y = clamp(this.velocity_y,-.8,.8)

		this.position_x += this.velocity_x;
		this.position_y += this.velocity_y;

		for(var epsilon = 0; epsilon<4; epsilon++){
			this.colors[epsilon] = (this.colors[epsilon]+Math.floor(Math.random()*8-4)+360)%360;

			for(var xx=1;xx<this.grid.x-1;xx++){
				for(var yy=1;yy<this.grid.y-1;yy++){
					this.grid.setValue(xx,yy, this.simplex((xx+this.position_x)/this.noise_y, (yy+this.position_y)/this.noise_y, this.elapsed_time))
				}
			}

			var border = generate_marching_border(this.grid, epsilon*.4-.6);
			svg += '<path stroke="black" fill="hsl('+this.colors[epsilon]+',50%,50%)" stroke-width="0" d="' + paths2string(border, this.display_x, this.display_y) + '"/>';
		}
		svg += '</svg>';

		this.colors[epsilon] = (this.colors[epsilon]+Math.floor(Math.random()*8-4)+360)%360;

		this.target.css("background-color",'hsl('+this.colors[epsilon]+',50%,50%)')
		this.target[0].innerHTML = svg;

		this.elapsed_time+=.01;

		if(this.state == effect_state.RUNNING){
			setTimeout(this.iterate.bind(this),30);
		}else if(this.state == effect_state.DOOMED){
			this.target[0].innerHTML = '<div></div>';
		}
	}
	stop(){
		this.state = effect_state.STOPPED;
	}
	resize(){
    var possible_x = Math.floor(this.target.width()*this.display_x)/this.display_x;
    var possible_y = Math.floor(this.target.height()*this.display_y)/this.display_y;

    if(possible_x == this.svg_x && possible_y == this.svg_y){
      return;
    }

    this.svg_x = possible_x;
    this.svg_y = possible_y;

    this.grid.resize(this.svg_x * this.display_x+1,
      this.svg_y * this.display_y+1)
	}
	clear(){
		this.state = effect_state.DOOMED;
		this.iterate();
	}
}

module.exports = effect