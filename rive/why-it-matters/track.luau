-- A line that fills the artboard. The part rides it on its own, and a
-- finger or pointer can grab it. Near the right end a mark and a ring appear.

type Track = {
	size: Vector,
	t: number,
	hold: number,
	dragging: boolean,
	line: Path,
	part: Path,
	mark: Path,
	ring: Path,
	linePaint: Paint,
	partPaint: Paint,
	markPaint: Paint,
	ringPaint: Paint,
}

local function clamp(value: number, low: number, high: number): number
	if value < low then
		return low
	end
	if value > high then
		return high
	end
	return value
end

local function metrics(self: Track): (number, number, number)
	local pad = math.max(36, self.size.x * 0.1)
	local y = self.size.y * 0.5
	local x0 = pad
	local x1 = math.max(x0 + 40, self.size.x - pad)
	return y, x0, x1
end

local function roundRect(path: Path, x: number, y: number, w: number, h: number, r: number)
	path:moveTo(Vector.xy(x + r, y))
	path:lineTo(Vector.xy(x + w - r, y))
	path:quadTo(Vector.xy(x + w, y), Vector.xy(x + w, y + r))
	path:lineTo(Vector.xy(x + w, y + h - r))
	path:quadTo(Vector.xy(x + w, y + h), Vector.xy(x + w - r, y + h))
	path:lineTo(Vector.xy(x + r, y + h))
	path:quadTo(Vector.xy(x, y + h), Vector.xy(x, y + h - r))
	path:lineTo(Vector.xy(x, y + r))
	path:quadTo(Vector.xy(x, y), Vector.xy(x + r, y))
	path:close()
end

local function circle(path: Path, cx: number, cy: number, radius: number)
	local k = 0.5522847498 * radius
	path:moveTo(Vector.xy(cx + radius, cy))
	path:cubicTo(Vector.xy(cx + radius, cy + k), Vector.xy(cx + k, cy + radius), Vector.xy(cx, cy + radius))
	path:cubicTo(Vector.xy(cx - k, cy + radius), Vector.xy(cx - radius, cy + k), Vector.xy(cx - radius, cy))
	path:cubicTo(Vector.xy(cx - radius, cy - k), Vector.xy(cx - k, cy - radius), Vector.xy(cx, cy - radius))
	path:cubicTo(Vector.xy(cx + k, cy - radius), Vector.xy(cx + radius, cy - k), Vector.xy(cx + radius, cy))
	path:close()
end

local function place(self: Track, event: PointerEvent)
	local _, x0, x1 = metrics(self)
	self.t = clamp((event.position.x - x0) / (x1 - x0), 0, 1)
	self.hold = 0
	event:hit()
end

function init(self: Track, _context: Context): boolean
	return true
end

function resize(self: Track, size: Vector, _scale: number)
	self.size = size
end

function pointerDown(self: Track, event: PointerEvent)
	self.dragging = true
	place(self, event)
end

function pointerMove(self: Track, event: PointerEvent)
	if self.dragging then
		place(self, event)
	end
end

function pointerUp(self: Track, event: PointerEvent)
	self.dragging = false
	event:hit()
end

function pointerExit(self: Track, _event: PointerEvent)
	self.dragging = false
end

function advance(self: Track, seconds: number): boolean
	if not self.dragging then
		if self.t < 1 then
			self.t = math.min(1, self.t + seconds / 2.6)
			self.hold = 0
		else
			self.hold += seconds
			if self.hold > 0.75 then
				self.t = 0
				self.hold = 0
			end
		end
	end
	return true
end

function draw(self: Track, renderer: Renderer)
	if self.size.x < 2 or self.size.y < 2 then
		return
	end

	local y, x0, x1 = metrics(self)
	local x = x0 + (x1 - x0) * self.t
	local late = clamp((self.t - 0.72) / 0.28, 0, 1)

	self.line:reset()
	self.line:moveTo(Vector.xy(x0, y))
	self.line:lineTo(Vector.xy(x - 20, y))
	self.line:moveTo(Vector.xy(x + 20, y))
	self.line:lineTo(Vector.xy(x1, y))
	renderer:drawPath(self.line, self.linePaint)

	if late > 0 then
		self.mark:reset()
		roundRect(self.mark, x1 - 1.5, y - 22, 3, 28, 1.5)
		self.markPaint.color = Color.rgba(226, 75, 58, math.floor(255 * late))
		renderer:drawPath(self.mark, self.markPaint)

		self.ring:reset()
		circle(self.ring, x1, y, 16 + late * 26)
		self.ringPaint.color = Color.rgba(226, 75, 58, math.floor(180 * (1 - late * 0.35)))
		renderer:drawPath(self.ring, self.ringPaint)
	end

	self.part:reset()
	self.part:moveTo(Vector.xy(x - 18, y - 10))
	self.part:lineTo(Vector.xy(x + 18, y - 10))
	self.part:lineTo(Vector.xy(x + 18, y + 10))
	self.part:lineTo(Vector.xy(x - 18, y + 10))
	self.part:close()
	renderer:drawPath(self.part, self.partPaint)
end

return function(_context: Context): Layout<Track>
	return {
		size = Vector.xy(0, 0),
		t = 0,
		hold = 0,
		dragging = false,
		line = Path.new(),
		part = Path.new(),
		mark = Path.new(),
		ring = Path.new(),
		linePaint = Paint.with({ style = 'stroke', thickness = 2, color = Color.rgba(231, 211, 176, 140) }),
		partPaint = Paint.with({ style = 'fill', color = Color.rgb(243, 239, 230) }),
		markPaint = Paint.with({ style = 'fill', color = Color.rgb(226, 75, 58) }),
		ringPaint = Paint.with({ style = 'stroke', thickness = 2, color = Color.rgba(226, 75, 58, 180) }),
		init = init,
		resize = resize,
		pointerDown = pointerDown,
		pointerMove = pointerMove,
		pointerUp = pointerUp,
		pointerExit = pointerExit,
		advance = advance,
		draw = draw,
	}
end
