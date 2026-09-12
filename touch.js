// -- Touch --

let crossX;
let crossY;
let touchA_ID;
let touchB_ID;
let touchC_ID;

function UpdateTouchDir( touch )
{
	joyTouch &= 0xfff0;
	
	let a = 0;
	if( touch.clientX != crossX || touch.clientY != crossY )
	{
		a = Math.atan2( crossX - touch.clientX, touch.clientY - crossY );
	}
	let dir = Math.round( a / Math.PI * 4 + 4 ) & 7;
	if( dir == 0 ) joyTouch |= JOY_UP;
	if( dir == 1 ) joyTouch |= JOY_UP | JOY_RIGHT;
	if( dir == 2 ) joyTouch |= JOY_RIGHT;
	if( dir == 3 ) joyTouch |= JOY_RIGHT | JOY_DOWN;
	if( dir == 4 ) joyTouch |= JOY_DOWN;
	if( dir == 5 ) joyTouch |= JOY_DOWN | JOY_LEFT;
	if( dir == 6 ) joyTouch |= JOY_LEFT;
	if( dir == 7 ) joyTouch |= JOY_LEFT | JOY_UP;
}

document.addEventListener( 'touchstart', function( event )
{
	const t = event.changedTouches;
	for( let i = 0; i < t.length; i++ )
	{
		if( document.getElementById( 'dpadCross' ) )
		{
			if( t[ i ].target == dpadCross )
			{
				let r = dpadCross.getBoundingClientRect();
				crossX = r.left + ( r.right - r.left ) / 2;
				crossY = r.top + ( r.bottom - r.top ) / 2;
				UpdateTouchDir( t[ i ] );
			}
		}
		if( document.getElementById( 'dpadA' ) )
		{
			if( t[ i ].target == dpadA )
			{
				touchA_ID = t[ i ].identifier;
				joyTouch |= JOY_BUTTONA;
			}
		}
		if( document.getElementById( 'dpadB' ) )
		{
			if( t[ i ].target == dpadB )
			{
				touchB_ID = t[ i ].identifier;
				joyTouch |= JOY_BUTTONB;
			}
		}
		if( document.getElementById( 'dpadC' ) )
		{
			if( t[ i ].target == dpadC )
			{
				touchC_ID = t[ i ].identifier;
				joyTouch |= JOY_BUTTONC;
			}
		}
	}
});

document.addEventListener( 'touchmove', function( event )
{
	const t = event.changedTouches;
	for( let i = 0; i < t.length; i++ )
	{
		if( t[ i ].target == dpadCross )
		{
			UpdateTouchDir( t[ i ] );
		}
	}
});

document.addEventListener( 'touchend', function( event )
{
	const t = event.changedTouches;
	for( let i = 0; i < t.length; i++ )
	{
		if( t[ i ].identifier == touchA_ID )
		{
			joyTouch &= 0xffff - JOY_BUTTONA;
			touchA_ID = undefined;
			bShowPlayButton = false;
			event.preventDefault();
		}
		else if( t[ i ].identifier == touchB_ID )
		{
			joyTouch &= 0xffff - JOY_BUTTONB;
			touchB_ID = undefined;
			bShowPlayButton = false;
			event.preventDefault();
		}
		else if( t[ i ].identifier == touchC_ID )
		{
			joyTouch &= 0xffff - JOY_BUTTONC;
			touchC_ID = undefined;
			bShowPlayButton = false;
			event.preventDefault();
		}
		else
		{
			if( t[ i ].target == dpadVoid || t[ i ].target == dpadCross )
			{
				event.preventDefault();
			}
			joyTouch &= 0xfff0;
		}
	}
});
