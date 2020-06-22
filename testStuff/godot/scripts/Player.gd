extends KinematicBody2D

const ACCEL = 1024
const MAX_SPEED = 128
const AIR_RESISTANCE = 0.02
const FRICTION = 0.25
const GRAVITY = 250
const JUMP_FORCE = 160

var motion = Vector2.ZERO

onready var sprite = $Sprite
onready var animationPlayer = $AnimationPlayer

func _physics_process(delta):
	var x_input = Input.get_action_strength("ui_right") - Input.get_action_strength("ui_left")

	if animationPlayer.current_animation != "jump": 
		animationPlayer.play("jump")

	if x_input != 0:
		animationPlayer.play("Run")
		motion.x += x_input * ACCEL * delta
		motion.x = clamp(motion.x, -MAX_SPEED, MAX_SPEED)
		sprite.flip_h = x_input < 0
	else: 
		animationPlayer.play("Stand")

			
	motion.y += GRAVITY * delta
	
	if is_on_floor(): 
		if x_input == 0:
			motion.x = lerp(motion.x, 0, FRICTION)
			
		if Input.is_action_just_pressed("ui_select"):
			motion.y = -JUMP_FORCE
	else: 
		if (motion.y < 0):
			animationPlayer.play("Jump")
		else: 
			animationPlayer.play("Land")
		
		if Input.is_action_just_released("ui_select") and motion.y < -JUMP_FORCE/2:
			motion.y = -JUMP_FORCE/2
		if x_input == 0: 
			motion.x = lerp(motion.x, 0, AIR_RESISTANCE)
	
	motion = move_and_slide(motion, Vector2.UP)
	
