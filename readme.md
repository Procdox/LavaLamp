# Lava Lamp SVG Element
This tool simply creates a "lava lamp" effect in a contained SVG element. Multiple independent elements can be present on the same page, but performance may suffer.

## Getting Started
1. Create an empty div object anywhere you like.
```
<div  id="board"></div>
```
2. Include simplex-noise.min.js and effect.js
```
<script src="js/simplex-noise.min.js"></script>
<script src="js/effect.js"></script>
```
3. Create a simplex object
```
var simplex = new SimplexNoise()
```
4. Create your effect object, pointing it at the simplex object and div you created
```
var manager = new effect(simplex.noise3D.bind(simplex), pointer, .1, .1)
```
5. Start your effect
```
manager.start()
```
And thats it!

## Effect Object
The constructor for the effect object takes 4 parameters.
A 3D noise function, a div target, and an X/Y "density"
The noise function can be any function with 3 number parameters that returns a number. If you like, you can create your own noise function and see how it interacts. You are not limited to the one I use.
The div target should be empty, this code make no attempt to play nice with existing contents.
Lastly, the "density" parameters specify how many test points the object should house. The higher the density, the more detailed the lamp. However it tends to look better at lower densities, and is also much less expensive.

The effect can be started, manually iterated, stopped, and cleared with the following respective commands.
```
manager.start()
manager.iterate()
manager.stop()
manager.clear()
```
stop will pause the animation, clear will empty the div as well.

You can also force the effect to adjust to a change in the div's size, via the resize command
```
manager.resize()
```
The code will not automatically detect changes to the div, you must detect this yourself.

Have fun!
MIT License included.
Copyright Andrew Blackledge 2018