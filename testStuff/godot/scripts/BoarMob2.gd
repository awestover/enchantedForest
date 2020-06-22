extends KinematicBody2D

const ACCEL = 1024
const MAX_SPEED = 128
const AIR_RESISTANCE = 0.02
const FRICTION = 0.25
const GRAVITY = 250
const JUMP_FORCE = 160

var EnemyMotion = Vector2.ZERO
var EnemyDirection = 1
var EnemyVel = 50

onready var sprite = $boarOld
onready var animationPlayer = $AnimationPlayer


func _ready():
	# motion.x += 10
	# motion = move_and_slide(motion, Vector2.UP)
	pass # Replace with function body.

func _physics_process(delta):
	EnemyMotion.y += GRAVITY
	if is_on_wall(): 
		EnemyDirection *= -1
		
	if EnemyDirection == 1: 
		sprite.flip_h = false
	elif EnemyDirection == -1: 
		sprite.flip_h = true
		
	EnemyMotion.x = EnemyDirection * EnemyVel
	EnemyMotion = move_and_slide(EnemyMotion, Vector2.UP)

