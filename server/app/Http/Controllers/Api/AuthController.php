<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        $data = $request->validated();
        $path = null;
        if ($request->hasFile('profilePicture')) {
            $path = $request->file('profilePicture')->store('public/profile-pictures');
            $path = Storage::url($path);
        }
        /** @var \App\Models\User $user */
        $user = User::create([
            'name'  => $data['name'],
            'email' => $data['email'],
            'password' => bcrypt($data['password']),
            'image' => $path,
            'role' => $data['role'],
            'banned' => $request['banned']
        ]);
        $contents = Storage::get(str_replace('/storage', 'public/', $path));
        $base64 = base64_encode($contents);
        $user->image = $base64;
        $token = $user->createToken('main')->plainTextToken;
        return response(compact('user', 'token'));
    }
    public function login(LoginRequest $request)
    {
        $credentials = $request->validated();
        if (!Auth::attempt($credentials)) {
            return response([
                'errors' => [
                    "password" => 'Неверный логин или пароль'
                ]
            ], 422);
        }
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $contents = Storage::get(str_replace('/storage', 'public/', $user->image));
        $base64 = base64_encode($contents);
        $user->image = $base64;
        $token = $user->createToken('main')->plainTextToken;
        return response(compact('user', 'token'));
    }
    public function logout(Request $request)
    {
        /** @var User $user */
        $user = $request->user();
        $user->currentAccessToken()->delete();
        return response('', 204);
    }
}
